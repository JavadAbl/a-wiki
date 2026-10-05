BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[FavoriteCourse] (
    [id] INT NOT NULL IDENTITY(1,1),
    [courseId] INT NOT NULL,
    [order] INT NOT NULL CONSTRAINT [FavoriteCourse_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FavoriteCourse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [FavoriteCourse_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FavoriteCourse_courseId_key] UNIQUE NONCLUSTERED ([courseId])
);

-- AddForeignKey
ALTER TABLE [dbo].[FavoriteCourse] ADD CONSTRAINT [FavoriteCourse_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH