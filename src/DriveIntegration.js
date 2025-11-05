/**
 * DriveIntegration.gs
 * Google Driveとの連携機能（フォルダ作成、バックアップ）を管理します。
 * (管理表の「作成」と「書き込み」のタイミングを分離)
 */

// =================================================================================
// === Google Drive フォルダ作成関連機能 ===
// =================================================================================

function bulkCreateMaterialFolders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const mainSheet = new MainSheet();
    const sheet = mainSheet.getSheet();
    const indices = mainSheet.indices;

    const requiredColumns = {
      KIBAN: indices.KIBAN, KIBAN_URL: indices.KIBAN_URL,
      MODEL: indices.MODEL, SERIES_URL: indices.SERIES_URL
    };
    for (const [key, value] of Object.entries(requiredColumns)) {
      if (!value) throw new Error(`必要な列「${key}」が見つかりません。`);
    }

    const lastRow = mainSheet.getLastRow();
    if (lastRow < mainSheet.startRow) {
      ss.toast("データがありません。");
      return;
    }

    const range = sheet.getRange(mainSheet.startRow, 1, lastRow - mainSheet.startRow + 1, mainSheet.getLastColumn());
    const values = range.getValues();
    const formulas = range.getFormulas();

    // 手順1: すべてのユニークな「機番」と「機種」を収集（既存リンクの有無に関わらず）
    const uniqueKibans = new Set();
    const uniqueModels = new Set();
    values.forEach((row, i) => {
      const kiban = String(row[indices.KIBAN - 1]).trim();
      if (kiban) uniqueKibans.add(kiban);

      const model = String(row[indices.MODEL - 1]).trim();
      if (model) {
        const match = model.match(/^[A-Za-z]+[0-9]+/);
        uniqueModels.add(match ? match[0] : model);
      }
    });

    // 手順2: フォルダを一括作成し、URLをマップに保存 & 空の管理表を作成
    const kibanUrlMap = new Map();
    uniqueKibans.forEach(kiban => {
      const folderResult = getOrCreateFolder_(kiban, CONFIG.FOLDERS.REFERENCE_MATERIAL_PARENT);
      if (folderResult && folderResult.folder) {
        kibanUrlMap.set(kiban, folderResult.folder.getUrl());
        // フォルダが「新規作成」された場合のみ、空の管理シートも生成する
        if (folderResult.isNew) {
           createBlankManagementSheet_(folderResult.folder, kiban);
        }
      }
    });

    const modelUrlMap = new Map();
    uniqueModels.forEach(modelPrefix => {
      const folderResult = getOrCreateFolder_(modelPrefix, CONFIG.FOLDERS.SERIES_MODEL_PARENT);
      if (folderResult && folderResult.folder) {
        modelUrlMap.set(modelPrefix, folderResult.folder.getUrl());
      }
    });
    
    // 手順3: 元のデータを保持し、変更箇所だけを更新する安全な方法
    const outputData = values.map((row, i) =>
      row.map((cell, j) => formulas[i][j] || cell)
    );

    let modified = false;
    values.forEach((row, i) => {
      const kiban = String(row[indices.KIBAN - 1]).trim();
      if (kibanUrlMap.has(kiban)) {
        // 既存リンクの有無に関わらず上書き
        outputData[i][indices.KIBAN_URL - 1] = createHyperlinkFormula(kibanUrlMap.get(kiban), kiban);
        modified = true;
      }
      const model = String(row[indices.MODEL - 1]).trim();
      if (model) {
        const match = model.match(/^[A-Za-z]+[0-9]+/);
        const groupValue = match ? match[0] : model;
        if (modelUrlMap.has(groupValue)) {
          // 既存リンクの有無に関わらず上書き
          outputData[i][indices.SERIES_URL - 1] = createHyperlinkFormula(modelUrlMap.get(groupValue), groupValue);
          modified = true;
        }
      }
    });

    // 手順4: 変更があった場合のみ、シートに書き戻す（数式は個別に設定）
    if (modified) {
      for (let i = 0; i < outputData.length; i++) {
        for (let j = 0; j < outputData[i].length; j++) {
          const cellValue = outputData[i][j];
          const cellRange = sheet.getRange(mainSheet.startRow + i, j + 1);

          if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
            cellRange.setFormula(cellValue);
          } else if (formulas[i][j]) {
            // 元から数式だった場合は保持
            cellRange.setFormula(formulas[i][j]);
          } else {
            cellRange.setValue(cellValue);
          }
        }
      }

      // 手順5: 工数シートにもリンクを同期
      syncLinksToInputSheets_(mainSheet);

      ss.toast("資料フォルダの作成とリンク設定が完了しました。");
    } else {
      ss.toast("すべてのリンクは既に設定済みです。");
    }

  } catch (error) {
    Logger.log(error.stack);
    ss.toast(`エラー: ${error.message}`);
  }
}

/**
 * メインシートのリンク列を全工数シートに同期する内部関数
 */
function syncLinksToInputSheets_(mainSheet) {
  const mainIndices = mainSheet.indices;
  const mainData = mainSheet.sheet.getRange(
    mainSheet.startRow, 1,
    mainSheet.getLastRow() - mainSheet.startRow + 1,
    mainSheet.getLastColumn()
  ).getValues();

  const mainFormulas = mainSheet.sheet.getRange(
    mainSheet.startRow, 1,
    mainSheet.getLastRow() - mainSheet.startRow + 1,
    mainSheet.getLastColumn()
  ).getFormulas();

  // メインシートのデータをマップに変換 (key: 管理No_作業区分)
  const mainLinksMap = new Map();
  mainData.forEach((row, i) => {
    const mgmtNo = row[mainIndices.MGMT_NO - 1];
    const sagyouKubun = row[mainIndices.SAGYOU_KUBUN - 1];
    if (!mgmtNo || !sagyouKubun) return;

    const key = `${mgmtNo}_${sagyouKubun}`;
    const kibanLink = mainFormulas[i][mainIndices.KIBAN_URL - 1] || row[mainIndices.KIBAN_URL - 1];
    const seriesLink = mainFormulas[i][mainIndices.SERIES_URL - 1] || row[mainIndices.SERIES_URL - 1];

    mainLinksMap.set(key, { kibanLink, seriesLink });
  });

  // 各工数シートを更新
  const tantoushaList = mainSheet.getTantoushaList();
  tantoushaList.forEach(tantousha => {
    try {
      const inputSheet = new InputSheet(tantousha.name);
      const inputIndices = inputSheet.indices;

      if (!inputIndices.KIBAN_URL || !inputIndices.SERIES_URL) {
        Logger.log(`工数シート「${tantousha.name}」にリンク列が見つかりません。先にrunAllManualMaintenance()を実行してください。`);
        return;
      }

      const lastRow = inputSheet.getLastRow();
      if (lastRow < inputSheet.startRow) return;

      const inputData = inputSheet.sheet.getRange(
        inputSheet.startRow, 1,
        lastRow - inputSheet.startRow + 1,
        inputSheet.getLastColumn()
      ).getValues();

      // 工数シートの各行に対してリンクを更新
      inputData.forEach((row, i) => {
        const mgmtNo = row[inputIndices.MGMT_NO - 1];
        const sagyouKubun = row[inputIndices.SAGYOU_KUBUN - 1];
        if (!mgmtNo || !sagyouKubun) return;

        const key = `${mgmtNo}_${sagyouKubun}`;
        const links = mainLinksMap.get(key);
        if (!links) return;

        const rowNum = inputSheet.startRow + i;

        // 機番リンクを設定
        if (links.kibanLink) {
          const kibanCell = inputSheet.sheet.getRange(rowNum, inputIndices.KIBAN_URL);
          if (typeof links.kibanLink === 'string' && links.kibanLink.startsWith('=')) {
            kibanCell.setFormula(links.kibanLink);
          } else {
            kibanCell.setValue(links.kibanLink);
          }
        }

        // STD資料リンクを設定
        if (links.seriesLink) {
          const seriesCell = inputSheet.sheet.getRange(rowNum, inputIndices.SERIES_URL);
          if (typeof links.seriesLink === 'string' && links.seriesLink.startsWith('=')) {
            seriesCell.setFormula(links.seriesLink);
          } else {
            seriesCell.setValue(links.seriesLink);
          }
        }
      });

      Logger.log(`工数シート「${tantousha.name}」へのリンク同期が完了しました。`);
    } catch (e) {
      Logger.log(`工数シート「${tantousha.name}」へのリンク同期中にエラー: ${e.message}`);
    }
  });
}

/**
 * 中身が空の管理表スプレッドシートを作成する
 */
function createBlankManagementSheet_(targetFolder, kiban) {
  const templateId = CONFIG.TEMPLATES.MANAGEMENT_SHEET_TEMPLATE_ID;
  if (!templateId || templateId.includes("...")) {
    const errorMsg = "テンプレートIDがConfig.jsに設定されていません。";
    Logger.log(errorMsg);
    // エラーをユーザーに通知（握りつぶさない）
    SpreadsheetApp.getActiveSpreadsheet().toast(errorMsg, "設定エラー", 5);
    return;
  }
  try {
    const templateFile = DriveApp.getFileById(templateId);
    const newFileName = `${kiban}盤配指示図出図管理表`;

    const existingFiles = targetFolder.getFilesByName(newFileName);
    if (existingFiles.hasNext()) {
      Logger.log(`管理表「${newFileName}」は既に存在するため作成をスキップします。`);
      return;
    }

    templateFile.makeCopy(newFileName, targetFolder);
    Logger.log(`空の管理表「${newFileName}」をフォルダ「${targetFolder.getName()}」に作成しました。`);
  } catch (e) {
    const errorMsg = `管理表の作成中にエラー: ${e.message}`;
    Logger.log(errorMsg);
    // ユーザーに通知
    SpreadsheetApp.getActiveSpreadsheet().toast(errorMsg, "エラー", 5);
  }
}


/**
 * 指定された名前のフォルダを、指定された親フォルダ内に作成または取得する内部関数。
 */
function getOrCreateFolder_(name, parentFolderId) {
  if (!name || !parentFolderId) return null;
  try {
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const folders = parentFolder.getFoldersByName(name);
    if (folders.hasNext()) {
      return { folder: folders.next(), isNew: false };
    }
    return { folder: parentFolder.createFolder(name), isNew: true };
  } catch (e) {
    Logger.log(`フォルダ作成/取得エラー: ${e.message}`);
    return null;
  }
}

// =================================================================================
// === 週次バックアップ機能 (変更なし) ===
// =================================================================================
function createWeeklyBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    if (!CONFIG.FOLDERS.BACKUP_PARENT) {
      throw new Error("バックアップ用フォルダIDが設定されていません。");
    }

    const originalName = ss.getName();
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), DATE_FORMATS.BACKUP_TIMESTAMP);
    const backupFileName = `${CONFIG.BACKUP.PREFIX}${originalName}_${timestamp}`;
    const parentFolder = DriveApp.getFolderById(CONFIG.FOLDERS.BACKUP_PARENT);

    DriveApp.getFileById(ss.getId()).makeCopy(backupFileName, parentFolder);

    const files = parentFolder.getFiles();
    const backupFiles = [];
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith(`${CONFIG.BACKUP.PREFIX}${originalName}`) && file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        backupFiles.push(file);
      }
    }

    if (backupFiles.length > CONFIG.BACKUP.KEEP_COUNT) {
      backupFiles.sort((a, b) => a.getDateCreated() - b.getDateCreated());
      const toDeleteCount = backupFiles.length - CONFIG.BACKUP.KEEP_COUNT;
      for (let i = 0; i < toDeleteCount; i++) {
        backupFiles[i].setTrashed(true);
      }
    }
    ss.toast("バックアップを作成しました。");
  } catch (e) {
    Logger.log(`バックアップエラー: ${e.message}`);
    ss.toast(`バックアップエラー: ${e.message}`);
  }
}