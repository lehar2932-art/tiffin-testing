import { IServiceProvider } from "@/models/ServiceProvider";

export class ProviderService {
  private static baseUrl = "/api";

  static async fetchProviders(): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
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

  static async fetchProvidersLinkedWithConsumer(): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/providers`, {
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
}
