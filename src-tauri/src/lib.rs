use tauri::{Manager, RunEvent};
use std::fs;
use chrono::Local;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit(); // pause exit to perform backup

                // Resolve directories using the correct Tauri v2 API
                let config_dir = app_handle.path().app_config_dir();
                let data_dir = app_handle.path().app_data_dir();

                match (config_dir, data_dir) {
                    (Ok(config_dir), Ok(app_data_dir)) => {
                        let source_db = config_dir.join("aerowis.db");
                        let backup_dir = app_data_dir.join("backupDB");

                        // Ensure backup folder exists
                        if let Err(e) = fs::create_dir_all(&backup_dir) {
                            eprintln!("❌ Failed to create backup directory: {}", e);
                        } else {
                            let date_str = Local::now().format("%d-%m-%Y").to_string();
                            let backup_path = backup_dir.join(format!("BackUp_({}).db", date_str));

                            if source_db.exists() {
                                match fs::copy(&source_db, &backup_path) {
                                    Ok(_) => println!("✅ Database backed up to {:?}", backup_path),
                                    Err(e) => eprintln!("❌ Failed to back up DB: {}", e),
                                }
                            } else {
                                println!("⚠️ No source DB found at {:?}", source_db);
                            }
                        }
                    }
                    _ => {
                        eprintln!("❌ Failed to resolve AppConfig or AppData directories.");
                    }
                }

                // Proceed with app exit after backup
                std::process::exit(0);
            }
        });
}