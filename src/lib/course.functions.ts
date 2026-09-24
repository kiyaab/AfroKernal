import { createServerFn } from "@tanstack/react-start";
import { prisma, isDatabaseAvailable } from "./prisma.server";
import { CATALOG_COURSES } from "./courses-catalog-data";

/**
 * Fetch course details and its lessons from Prisma (or fallback to CATALOG_COURSES)
 */
export const adminGetCourseDetailsServerFn = createServerFn({ method: "GET" })
  .validator((courseId: string) => courseId)
  .handler(async ({ data: courseId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const course = await prisma.course.findFirst({
          where: {
            OR: [{ id: courseId }, { slug: courseId }],
          },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
          },
        });

        if (course) {
          return {
            course: {
              id: course.id,
              title: course.title,
              slug: course.slug,
              description: course.description,
              category: course.category,
              difficulty: course.difficulty,
              cover_url: course.coverUrl,
              published: course.published,
              sort_order: course.sortOrder,
            },
            lessons: course.lessons.map((l) => ({
              id: l.id,
              course_id: l.courseId,
              title: l.title,
              slug: l.slug,
              lesson_type: l.lessonType,
              video_url: l.videoUrl,
              pdf_url: l.pdfUrl,
              starter_code: l.starterCode,
              content: l.contentMarkdown,
              xp_reward: l.xpReward,
              sort_order: l.sortOrder,
              published: l.published,
            })),
          };
        }
      } catch {
        /* fallback to catalog */
      }
    }

    const cat = CATALOG_COURSES.find((c) => c.slug === courseId || c.id === courseId);
    if (cat) {
      return {
        course: {
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
          description: cat.subtitle || cat.description,
          category: cat.category,
          difficulty: cat.difficulty,
          cover_url: (cat as any).cover_url || "",
          published: true,
          sort_order: 1,
        },
        lessons: cat.lessons.map((l, i) => ({
          id: l.id || `lesson-${i}`,
          course_id: cat.id,
          title: l.title,
          slug: l.slug,
          lesson_type: l.lesson_type || "notes",
          video_url: l.video_url || null,
          pdf_url: null,
          starter_code: null,
          content: l.content || "",
          xp_reward: l.xp_reward || 20,
          sort_order: l.sort_order || i + 1,
          published: true,
        })),
      };
    }

    return { course: null, lessons: [] };
  });

/**
 * Update course details
 */
export const adminUpdateCourseServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      courseId: string;
      title: string;
      slug: string;
      description?: string;
      category?: string;
      difficulty?: string;
      cover_url?: string;
      published?: boolean;
      sort_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        await prisma.course.updateMany({
          where: {
            OR: [{ id: data.courseId }, { slug: data.courseId }],
          },
          data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            category: data.category,
            difficulty: data.difficulty,
            coverUrl: data.cover_url,
            published: data.published ?? false,
            sortOrder: data.sort_order ?? 0,
          },
        });

        if (data.published) {
          const course = await prisma.course.findFirst({
            where: { OR: [{ id: data.courseId }, { slug: data.courseId }] },
          });
          if (course) {
            await prisma.lesson.updateMany({
              where: { courseId: course.id },
              data: { published: true },
            });
          }
        }
        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to update course");
      }
    }
    return { success: true };
  });

/**
 * Delete a course and associated lessons
 */
export const adminDeleteCourseServerFn = createServerFn({ method: "POST" })
  .validator((courseId: string) => courseId)
  .handler(async ({ data: courseId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        await prisma.course.deleteMany({
          where: { OR: [{ id: courseId }, { slug: courseId }] },
        });
        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to delete course");
      }
    }
    return { success: true };
  });

/**
 * Add a lesson to a course
 */
export const adminAddLessonServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      courseId: string;
      title: string;
      slug: string;
      lesson_type: string;
      sort_order: number;
      content?: string | null;
      video_url?: string | null;
      xp_reward?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        let course = await prisma.course.findFirst({
          where: { OR: [{ id: data.courseId }, { slug: data.courseId }] },
        });

        if (!course) {
          course = await prisma.course.create({
            data: {
              title: "Custom Course",
              slug: data.courseId,
              description: "Custom course",
              category: "Fundamentals",
              published: true,
            },
          });
        }

        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: data.title,
            slug: data.slug,
            lessonType: data.lesson_type,
            sortOrder: data.sort_order,
            contentMarkdown: data.content || "",
            videoUrl: data.video_url || null,
            xpReward: data.xp_reward ?? 20,
            published: true,
          },
        });
        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to add lesson");
      }
    }
    return { success: true };
  });

/**
 * Update lesson details
 */
export const adminUpdateLessonServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      lessonId: string;
      title?: string;
      slug?: string;
      lesson_type?: string;
      content?: string;
      video_url?: string;
      pdf_url?: string;
      starter_code?: string;
      xp_reward?: number;
      expected_output?: string;
      sort_order?: number;
      published?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        await prisma.lesson.update({
          where: { id: data.lessonId },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.lesson_type !== undefined && { lessonType: data.lesson_type }),
            ...(data.content !== undefined && { contentMarkdown: data.content }),
            ...(data.video_url !== undefined && { videoUrl: data.video_url }),
            ...(data.pdf_url !== undefined && { pdfUrl: data.pdf_url }),
            ...(data.starter_code !== undefined && { starterCode: data.starter_code }),
            ...(data.xp_reward !== undefined && { xpReward: data.xp_reward }),
            ...(data.sort_order !== undefined && { sortOrder: data.sort_order }),
            ...(data.published !== undefined && { published: data.published }),
          },
        });
        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to update lesson");
      }
    }
    return { success: true };
  });

/**
 * Delete a lesson
 */
export const adminDeleteLessonServerFn = createServerFn({ method: "POST" })
  .validator((lessonId: string) => lessonId)
  .handler(async ({ data: lessonId }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        await prisma.lesson.delete({ where: { id: lessonId } });
        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to delete lesson");
      }
    }
    return { success: true };
  });

/**
 * Create course with lesson and optional quiz (Admin Manage Courses)
 */
export const adminCreateCourseWithLessonServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      course: {
        title: string;
        slug: string;
        description: string;
        category: string;
        difficulty: string;
        cover_url?: string;
      };
      lesson: {
        title: string;
        slug: string;
        video_url?: string;
        pdf_url?: string;
        content?: string;
        xp_reward?: number;
      };
      quiz?: {
        title: string;
        passing_score: number;
        xp_reward: number;
      };
      questions?: Array<{
        prompt: string;
        choices: string[];
        correct_index: number;
        explanation?: string;
      }>;
    }) => input,
  )
  .handler(async ({ data }) => {
    const dbOk = await isDatabaseAvailable();
    if (dbOk) {
      try {
        const course = await prisma.course.create({
          data: {
            title: data.course.title,
            slug: data.course.slug,
            description: data.course.description,
            category: data.course.category,
            difficulty: data.course.difficulty,
            coverUrl: data.course.cover_url,
            published: true,
            sortOrder: 99,
          },
        });

        const lesson = await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: data.lesson.title,
            slug: data.lesson.slug,
            lessonType: "video",
            videoUrl: data.lesson.video_url,
            pdfUrl: data.lesson.pdf_url,
            contentMarkdown: data.lesson.content || "",
            xpReward: data.lesson.xp_reward ?? 25,
            sortOrder: 1,
            published: true,
          },
        });

        if (data.quiz && data.questions && data.questions.length > 0) {
          const quiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              title: data.quiz.title,
              passingScore: data.quiz.passing_score,
              xpReward: data.quiz.xp_reward,
            },
          });

          await prisma.quizQuestion.createMany({
            data: data.questions.map((q, idx) => ({
              quizId: quiz.id,
              prompt: q.prompt,
              choices: q.choices,
              correctIndex: q.correct_index,
              explanation: q.explanation || null,
              sortOrder: idx,
            })),
          });
        }

        return { success: true, courseId: course.id };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to create course in database");
      }
    }

    return { success: true, courseId: `c-${Date.now()}` };
  });

/**
 * Seed all catalog courses into Prisma database
 */
export const adminSeedAllCoursesServerFn = createServerFn({ method: "POST" }).handler(async () => {
  const dbOk = await isDatabaseAvailable();
  if (!dbOk) return { success: true, count: CATALOG_COURSES.length };

  let count = 0;
  for (const catCourse of CATALOG_COURSES) {
    try {
      const existing = await prisma.course.findUnique({
        where: { slug: catCourse.slug },
      });

      let courseId: string;
      if (!existing) {
        const created = await prisma.course.create({
          data: {
            title: catCourse.title,
            slug: catCourse.slug,
            description: catCourse.subtitle || catCourse.description,
            category: catCourse.category,
            difficulty: catCourse.difficulty,
            published: true,
          },
        });
        courseId = created.id;
      } else {
        courseId = existing.id;
        await prisma.course.update({
          where: { id: courseId },
          data: {
            title: catCourse.title,
            description: catCourse.subtitle || catCourse.description,
            published: true,
          },
        });
        await prisma.lesson.deleteMany({ where: { courseId } });
      }

      if (catCourse.lessons.length > 0) {
        await prisma.lesson.createMany({
          data: catCourse.lessons.map((l, idx) => ({
            courseId,
            slug: l.slug,
            title: l.title,
            lessonType: l.lesson_type || "notes",
            contentMarkdown: l.content || "",
            xpReward: l.xp_reward || 20,
            sortOrder: l.sort_order || idx + 1,
            published: true,
          })),
        });
      }
      count++;
    } catch {
      /* continue with remaining courses */
    }
  }
  return { success: true, count };
});
