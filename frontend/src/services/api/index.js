// Single entry point for all API calls
// Import from here so pages don't need to know the internal file structure
//
// Usage in any page:
//   import { getMe, getRooms, getMessages } from "../services/api";

export * from "./userApi";
export * from "./roomApi";
export * from "./messageApi";
export * from "./propertyApi";
export * from "./profileApi";
export * from "./assignmentApi";
export * from "./maintenanceApi";
export * from "./notificationApi";
export * from "./ratingApi";