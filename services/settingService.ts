import { TSettings } from "@/types";

export class SettingsService {
  private static baseUrl = "/api/settings";

  static async fetchSettings(): Promise<{ data: TSettings; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      const setting = await response.json();
      return setting;
    } catch (error) {
      console.log("Error fetching settings:", error);
      throw error;
    }
  }

  static async updateSettings(
    payload: TSettings
  ): Promise<{ data: TSettings; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      return response.json();
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }
}
