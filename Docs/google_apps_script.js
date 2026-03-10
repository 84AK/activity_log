/**
 * Team Weekly Activity Log - Google Sheets Backend (Phase 7: Signup & Login Enabled)
 */

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = ["ID", "Week", "Team", "Author", "Prompt", "Link", "Summary", "Date", "Password"];
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
    const headers = ["Username", "Password", "CreatedAt"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#10B981").setFontColor("#FFFFFF").setFontWeight("bold");
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
    if (name === "Users") return; // 유저 시트는 제외

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
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || "create"; 
    const ADMIN_PASSWORD = "admin";
    
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
      
      usersSheet.appendRow([
        username, 
        password, 
        Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss")
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "가입 성공!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 로그인 (Login) ---
    if (action === "login") {
      const username = body.username ? body.username.toString() : "";
      const password = body.password ? body.password.toString() : "";
      
      if (username === "admin" && password === ADMIN_PASSWORD) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, role: "admin" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const usersSheet = getOrCreateUsersSheet();
      const userData = usersSheet.getDataRange().getValues();
      
      for (let i = 1; i < userData.length; i++) {
        const dbUser = userData[i][0] ? userData[i][0].toString() : "";
        const dbPass = userData[i][1] ? userData[i][1].toString() : "";
        
        if (dbUser === username && dbPass === password) {
          return ContentService.createTextOutput(JSON.stringify({ success: true, role: "student" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
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
      setVal("Week", body.week || "1주차");
      setVal("Team", body.team || "팀 미정");
      setVal("Author", body.author || "작성자 미정");
      setVal("Prompt", body.prompt || "");
      setVal("Link", body.link || "");
      setVal("Summary", body.summary || "");
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
        if (sheet.getName() === "Users") continue;
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
      
      // 권한 체크
      if (pass !== actualPass && pass !== ADMIN_PASSWORD) {
        return ContentService.createTextOutput(JSON.stringify({ error: "권한이 없습니다." })).setMimeType(ContentService.MimeType.JSON);
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
        updateCell("Week", body.week);
        updateCell("Team", body.team);
        updateCell("Prompt", body.prompt);
        updateCell("Link", body.link);
        updateCell("Summary", body.summary);
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }
    }
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
