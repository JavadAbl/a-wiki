BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[CourseRelatedCourse] (
    [courseId] INT NOT NULL,
    [relatedCourseId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CourseRelatedCourse_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CourseRelatedCourse_pkey] PRIMARY KEY CLUSTERED ([courseId],[relatedCourseId])
);

-- AddForeignKey
ALTER TABLE [dbo].[CourseRelatedCourse] ADD CONSTRAINT [CourseRelatedCourse_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CourseRelatedCourse] ADD CONSTRAINT [CourseRelatedCourse_relatedCourseId_fkey] FOREIGN KEY ([relatedCourseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH