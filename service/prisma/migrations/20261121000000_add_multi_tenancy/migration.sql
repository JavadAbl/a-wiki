/*
  Multi-tenancy:
  - New Tenant table; a single default tenant (id = 1) is inserted and ALL
    existing rows are back-filled into it, so a pre-multi-tenant deployment
    keeps working unchanged.
  - Every tenant-owned table gets a tenantId column.
  - Global unique constraints (User.nationalCode, Category.name, Course.title)
    become per-tenant unique indexes.
*/

BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tenant] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [logoUrl] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [Tenant_isActive_df] DEFAULT 1,
    [order] INT NOT NULL CONSTRAINT [Tenant_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tenant_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- seed the default tenant that owns all pre-existing data
SET IDENTITY_INSERT [dbo].[Tenant] ON;
INSERT INTO [dbo].[Tenant] ([id], [name], [slug], [description], [isActive], [order], [createdAt], [updatedAt])
VALUES (1, N'نمونه پیش‌فرض', N'default', NULL, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
SET IDENTITY_INSERT [dbo].[Tenant] OFF;

-- AlterTable: add tenantId columns
-- User stays nullable: tenantId == NULL marks the global (seeded) SuperAdmin
ALTER TABLE [dbo].[User] ADD [tenantId] INT NULL;
ALTER TABLE [dbo].[Category] ADD [tenantId] INT NOT NULL CONSTRAINT [Category_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Link] ADD [tenantId] INT NOT NULL CONSTRAINT [Link_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Course] ADD [tenantId] INT NOT NULL CONSTRAINT [Course_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Document] ADD [tenantId] INT NOT NULL CONSTRAINT [Document_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Section] ADD [tenantId] INT NOT NULL CONSTRAINT [Section_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Part] ADD [tenantId] INT NOT NULL CONSTRAINT [Part_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[Content] ADD [tenantId] INT NOT NULL CONSTRAINT [Content_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[FavoriteCourse] ADD [tenantId] INT NOT NULL CONSTRAINT [FavoriteCourse_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[PartView] ADD [tenantId] INT NOT NULL CONSTRAINT [PartView_tenantId_df] DEFAULT 1;
ALTER TABLE [dbo].[CourseRelatedCourse] ADD [tenantId] INT NOT NULL CONSTRAINT [CourseRelatedCourse_tenantId_df] DEFAULT 1;

-- CreateIndex / FK (only root tables carry a real FK; child tables are reached
-- through their parent and cascade-delete with it)
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Link] ADD CONSTRAINT [Link_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Course] ADD CONSTRAINT [Course_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- uniqueness becomes per-tenant
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_nationalCode_key];
CREATE UNIQUE INDEX [User_tenantId_nationalCode_key] ON [dbo].[User]([tenantId], [nationalCode]);

ALTER TABLE [dbo].[Category] DROP CONSTRAINT [Category_name_key];
CREATE UNIQUE INDEX [Category_tenantId_name_key] ON [dbo].[Category]([tenantId], [name]);

ALTER TABLE [dbo].[Course] DROP CONSTRAINT [Course_title_key];
CREATE UNIQUE INDEX [Course_tenantId_title_key] ON [dbo].[Course]([tenantId], [title]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
