BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Group] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Group_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Group_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Group_name_key] UNIQUE ([name])
);

-- CreateTable
CREATE TABLE [dbo].[GroupCourse] (
    [id] INT NOT NULL IDENTITY(1,1),
    [groupId] INT NOT NULL,
    [courseId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [GroupCourse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [GroupCourse_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [GroupCourse_groupId_courseId_key] UNIQUE ([groupId],[courseId])
);

-- CreateTable
CREATE TABLE [dbo].[GroupCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [groupId] INT NOT NULL,
    [categoryId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [GroupCategory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [GroupCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [GroupCategory_groupId_categoryId_key] UNIQUE ([groupId],[categoryId])
);

-- AlterTable
ALTER TABLE [dbo].[User] ADD [groupId] INT;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GroupCourse] ADD CONSTRAINT [GroupCourse_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GroupCourse] ADD CONSTRAINT [GroupCourse_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GroupCategory] ADD CONSTRAINT [GroupCategory_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GroupCategory] ADD CONSTRAINT [GroupCategory_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
