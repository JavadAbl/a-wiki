export const SERVICE_PERMISSION = 'service' as const;

export const generateActionPermissionName = (controller: string, action: string) =>
  `${SERVICE_PERMISSION}.${controller}.${action}`;

export const generateControllerPermissionName = (controller: string) => `${SERVICE_PERMISSION}.${controller}`;
