import {
  writeFile,
  exists,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

import male_avt from "../assets/male_avt.png";
import female_avt from "../assets/female_avt.png";

class ProfilePhoto {
  static async getUrl(student) {
    if (!student?.reg_no) {
      console.error("Invalid student object:", student);
      return male_avt;
    }

    try {
      const folder = "profile_images";
      const fileName = `${student.reg_no}.png`;

      const appDataPath = await appDataDir();
      const folderPath = await join(appDataPath, folder);
      const filePath = await join(folderPath, fileName);

      // 1. Ensure profile_images folder exists
      const folderExists = await exists(folderPath);
      if (!folderExists) {
        await mkdir(folderPath, { recursive: true });
      }

      // 2. If profile image doesn't exist, use placeholder
      const photoExists = await exists(filePath);
      if (!photoExists) {
        const placeholderUrl =
          student.gender?.toLowerCase() === "female" ? female_avt : male_avt;

        const response = await fetch(placeholderUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch placeholder image");
        }

        const buffer = new Uint8Array(await response.arrayBuffer());

        await writeFile(filePath, buffer,{
            dir: BaseDirectory.AppData,
          }
        );
      }

      // 3. Return Tauri file URL
      return `${convertFileSrc(filePath)}?t=${Date.now()}`;
    } catch (err) {
      console.error("Failed to get profile photo URL:", err);
      return male_avt;
    }
  }
}

export default ProfilePhoto;
