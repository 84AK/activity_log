function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = ["ID", "Week", "Team", "Author", "Prompt", "Link", "Summary", "Score", "Model", "Date", "Password"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#2563EB").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    if (headers.indexOf("Password") === -1) {
      sheet.getRange(1, headers.length + 1).setValue("Password")
        .setBackground("#2563EB").setFontColor("#FFFFFF").setFontWeight("bold");
    }
  }
  return sheet;
}

function getOrCreateUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Users");
  
  if (!sheet) {
    sheet = ss.insertSheet("Users");
    const headers = ["Username", "Password", "CreatedAt", "Role"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#10B981").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(['admin', 'student']).setAllowInvalid(false).build();
    sheet.getRange(2, 4, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
  } else {
    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    if (headers.indexOf("Role") === -1) {
      const roleCol = headers.length + 1;
      sheet.getRange(1, roleCol).setValue("Role")
        .setBackground("#10B981").setFontColor("#FFFFFF").setFontWeight("bold");
        
      const rule = SpreadsheetApp.newDataValidation().requireValueInList(['admin', 'student']).setAllowInvalid(false).build();
      sheet.getRange(2, roleCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
    }
  }
  return sheet;
}

function getOrCreateResourcesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Resources");
  
  if (!sheet) {
    sheet = ss.insertSheet("Resources");
    const headers = ["ID", "Title", "Content", "Author", "Date"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#8B5CF6").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// GET 요청 처리 (전체 시트 데이터 가져오기)
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let allData = [];

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name === "Users" || name === "Resources") return; // 유저 시트와 자료실 시트는 제외

    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const rows = data.slice(1);
      
      const result = rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          if (header !== "Password") {
            obj[header] = row[index];
          }
        });
        return obj;
      });
      allData = allData.concat(result);
    }
  });

  return ContentService.createTextOutput(JSON.stringify({ data: allData }))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST 요청 처리
function doPost(e) {
  const AUTH_TOKEN = "vibe_auth_2026_secure_key"; // Next.js 서버의 AUTH_TOKEN과 일치해야 함
  
  try {
    const body = JSON.parse(e.postData.contents);
    
    // 보안 토큰 검증
    if (body.authToken !== AUTH_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized access" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = body.action || "create"; 
    const isAdmin = body.isAdmin === true; // 서버(Next.js Proxy)에서 검증된 플래그 사용
    
    // --- 회원가입 (Signup) ---
    if (action === "signup") {
      const usersSheet = getOrCreateUsersSheet();
      const userData = usersSheet.getDataRange().getValues();
      const username = body.username;
      const password = body.password;
      
      if (!username || !password) {
        return ContentService.createTextOutput(JSON.stringify({ error: "아이디와 비밀번호를 입력해주세요." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // 중복 체크
      for (let i = 1; i < userData.length; i++) {
        if (userData[i][0] === username) {
          return ContentService.createTextOutput(JSON.stringify({ error: "이미 존재하는 아이디입니다." }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      const headers = userData[0] || [];
      const roleIdx = headers.indexOf("Role");
      const newRow = [
        username, 
        password, 
        Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss")
      ];
      
      // Role 컬럼이 있다면 기본값으로 student 자동 입력
      if (roleIdx !== -1) {
        newRow[roleIdx] = "student";
      }
      
      usersSheet.appendRow(newRow);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "가입 성공!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 로그인 (Login) ---
    if (action === "login") {
      const username = body.username ? body.username.toString() : "";
      const password = body.password ? body.password.toString() : "";
      
      const usersSheet = getOrCreateUsersSheet();
      const userData = usersSheet.getDataRange().getValues();
      const headers = userData[0] || [];
      const roleIdx = headers.indexOf("Role");
      
      for (let i = 1; i < userData.length; i++) {
        const dbUser = userData[i][0] ? userData[i][0].toString() : "";
        const dbPass = userData[i][1] ? userData[i][1].toString() : "";
        
        if (dbUser === username && dbPass === password) {
          const userRole = (roleIdx !== -1 && userData[i][roleIdx]) 
                            ? userData[i][roleIdx].toString().trim().toLowerCase() 
                            : "";
          const finalRole = (userRole === "admin" || userRole === "관리자") ? "admin" : "student";

          return ContentService.createTextOutput(JSON.stringify({ success: true, role: finalRole }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // 혹시 대비한 서버 강제 우회 설정 (이전 admin 직접 로그인 호환용)
      if (username === "admin" && isAdmin) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, role: "admin" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 데이터 생성 (Create) ---
    if (action === "create") {
      const dateObj = new Date();
      const sheetName = Utilities.formatDate(dateObj, "Asia/Seoul", "yyyy-MM-dd");
      const sheet = getOrCreateSheet(sheetName);
      const dataHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newId = dateObj.getTime().toString();
      
      const rowData = new Array(dataHeaders.length).fill("");
      const setVal = (key, val) => {
        const idx = dataHeaders.indexOf(key);
        if (idx !== -1) rowData[idx] = val;
      };
      
      setVal("ID", newId);
      setVal("Week", body.week || dateObj.toISOString().split('T')[0]); // 주차 컬럼에 선택된 날짜 저장
      setVal("Team", body.team || "팀 미정");
      setVal("Author", body.author || "작성자 미정");
      setVal("Prompt", body.prompt || "");
      setVal("Link", body.link || "");
      setVal("Summary", body.summary || "");
      setVal("Score", body.score || "");
      setVal("Model", body.model || "");
      setVal("Date", dateObj.toISOString().split('T')[0]);
      setVal("Password", body.password || "");
      
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 수정/삭제 (Edit/Delete) ---
    if (action === "edit" || action === "delete") {
      const targetId = body.id;
      const pass = body.password;
      
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();
      let targetSheet = null;
      let rowIndex = -1;
      let actualPass = "";
      let headers = [];
      
      for (let s = 0; s < sheets.length; s++) {
        const sheet = sheets[s];
        if (sheet.getName() === "Users" || sheet.getName() === "Resources") continue;
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) continue;
        
        headers = data[0];
        const idIndex = headers.indexOf("ID");
        const passIndex = headers.indexOf("Password");
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][idIndex].toString() === targetId.toString()) {
            targetSheet = sheet;
            rowIndex = i + 1;
            actualPass = passIndex !== -1 && data[i][passIndex] ? data[i][passIndex].toString() : "";
            break;
          }
        }
        if (targetSheet) break;
      }
      
      if (!targetSheet) return ContentService.createTextOutput(JSON.stringify({ error: "기록을 찾을 수 없습니다." })).setMimeType(ContentService.MimeType.JSON);
      
      // 본인이거나 관리자인 경우 허용
      if (actualPass !== pass && !isAdmin) {
        return ContentService.createTextOutput(JSON.stringify({ error: "권한이 없습니다." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      if (action === "delete") {
        targetSheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }
      
      if (action === "edit") {
        const updateCell = (key, val) => {
          const idx = headers.indexOf(key);
          if (idx !== -1 && val !== undefined) targetSheet.getRange(rowIndex, idx + 1).setValue(val);
        };
        updateCell("Week", body.week); // 수정 시 날짜 동기화
        updateCell("Team", body.team);
        updateCell("Prompt", body.prompt);
        updateCell("Link", body.link);
        updateCell("Summary", body.summary);
        updateCell("Score", body.score);
        updateCell("Model", body.model);
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // --- 데이터 통합 요청 (Batch Fetch) ---
    if (action === "getAllData") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();
      let allLogs = [];

      // 1. Logs 데이터 가져오기 (doGet 로직 통합)
      sheets.forEach(sheet => {
        const name = sheet.getName();
        if (name === "Users" || name === "Resources") return; 

        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1);
          
          const result = rows.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
              if (header !== "Password") {
                obj[header] = row[index];
              }
            });
            return obj;
          });
          allLogs = allLogs.concat(result);
        }
      });

      // 2. Resources 데이터 가져오기 (getResources 로직 통합)
      const resourceSheet = getOrCreateResourcesSheet();
      const resData = resourceSheet.getDataRange().getValues();
      let allResources = [];
      
      if (resData.length > 1) {
        const rows = resData.slice(1);
        allResources = rows.map(row => ({
          id: row[0],
          title: row[1],
          content: row[2],
          author: row[3],
          date: row[4] ? Utilities.formatDate(new Date(row[4]), "Asia/Seoul", "yyyy-MM-dd HH:mm") : ""
        }));
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        logs: allLogs, 
        resources: allResources 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 자료실 (Resources) 관련 ---
    
    // 1. 자료실 목록 가져오기
    if (action === "getResources") {
      const resourceSheet = getOrCreateResourcesSheet();
      const data = resourceSheet.getDataRange().getValues();
      if (data.length <= 1) {
         return ContentService.createTextOutput(JSON.stringify({ data: [] })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const rows = data.slice(1);
      const resourcesList = rows.map(row => ({
        id: row[0],
        title: row[1],
        content: row[2],
        author: row[3],
        date: row[4] ? Utilities.formatDate(new Date(row[4]), "Asia/Seoul", "yyyy-MM-dd HH:mm") : ""
      }));
      
      return ContentService.createTextOutput(JSON.stringify({ data: resourcesList })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 자료실 자료 등록 (Create Resource) - 관리자 전용 ---
    if (action === "createResource") {
      if (!isAdmin) {
        return ContentService.createTextOutput(JSON.stringify({ error: "권한이 없습니다." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const resourceSheet = getOrCreateResourcesSheet();
      const newId = new Date().getTime().toString();
      const now = new Date();
      
      resourceSheet.appendRow([newId, body.title, body.content, body.author, now]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: newId })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 자료실 자료 삭제 (Delete Resource) - 관리자 전용 ---
    if (action === "deleteResource") {
      if (!isAdmin) {
        return ContentService.createTextOutput(JSON.stringify({ error: "권한이 없습니다." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const resourceSheet = getOrCreateResourcesSheet();
      const resRows = resourceSheet.getDataRange().getValues();
      for (let i = 1; i < resRows.length; i++) {
        if (String(resRows[i][0]) === String(body.id)) {
          resourceSheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ error: "해당 자료를 찾을 수 없습니다." })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 자료실 자료 수정 (Edit Resource) - 관리자 전용 ---
    if (action === "editResource") {
      if (!isAdmin) {
        return ContentService.createTextOutput(JSON.stringify({ error: "권한이 없습니다." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const resourceSheet = getOrCreateResourcesSheet();
      const data = resourceSheet.getDataRange().getValues();
      const headers = data[0];
      let rowIndex = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) return ContentService.createTextOutput(JSON.stringify({ error: "기록을 찾을 수 없습니다." })).setMimeType(ContentService.MimeType.JSON);

      const updateCell = (key, val) => {
        const idx = headers.indexOf(key);
        if (idx !== -1 && val !== undefined) resourceSheet.getRange(rowIndex, idx + 1).setValue(val);
      };

      updateCell("Title", body.title);
      updateCell("Content", body.content);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
