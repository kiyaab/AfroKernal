import { PrismaClient } from "@prisma/client";
import { CATALOG_COURSES } from "../src/lib/courses-catalog-data.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting AfroKernel curriculum seed...");

  for (let courseIndex = 0; courseIndex < CATALOG_COURSES.length; courseIndex++) {
    const catalogCourse = CATALOG_COURSES[courseIndex];

    const course = await prisma.course.upsert({
      where: {
        slug: catalogCourse.slug,
      },
      update: {
        title: catalogCourse.title,
        subtitle: catalogCourse.subtitle,
        description: catalogCourse.description,
        category: catalogCourse.category,
        difficulty: catalogCourse.difficulty,
        duration: catalogCourse.duration_hours,
        rating: catalogCourse.rating,
        reviewCount: catalogCourse.review_count,
        learnerCount: catalogCourse.learner_count,
        featured: catalogCourse.featured ?? false,
        published: true,
        sortOrder: courseIndex + 1,
      },
      create: {
        slug: catalogCourse.slug,
        title: catalogCourse.title,
        subtitle: catalogCourse.subtitle,
        description: catalogCourse.description,
        category: catalogCourse.category,
        difficulty: catalogCourse.difficulty,
        duration: catalogCourse.duration_hours,
        rating: catalogCourse.rating,
        reviewCount: catalogCourse.review_count,
        learnerCount: catalogCourse.learner_count,
        featured: catalogCourse.featured ?? false,
        published: true,
        sortOrder: courseIndex + 1,
      },
    });

    console.log(`Course: ${course.slug}`);

    for (const catalogLesson of catalogCourse.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: {
          courseId_slug: {
            courseId: course.id,
            slug: catalogLesson.slug,
          },
        },
        update: {
          title: catalogLesson.title,
          lessonType: catalogLesson.lesson_type,
          videoUrl: catalogLesson.video_url ?? null,
          durationMinutes: catalogLesson.duration_minutes,
          xpReward: catalogLesson.xp_reward,
          sortOrder: catalogLesson.sort_order,
          contentMarkdown: catalogLesson.content,
        },
        create: {
          courseId: course.id,
          slug: catalogLesson.slug,
          title: catalogLesson.title,
          lessonType: catalogLesson.lesson_type,
          videoUrl: catalogLesson.video_url ?? null,
          durationMinutes: catalogLesson.duration_minutes,
          xpReward: catalogLesson.xp_reward,
          sortOrder: catalogLesson.sort_order,
          contentMarkdown: catalogLesson.content,
        },
      });

      if (catalogLesson.quiz) {
        const quiz = await prisma.quiz.upsert({
          where: {
            lessonId: lesson.id,
          },
          update: {
            title: `${catalogLesson.title} Quiz`,
            description: `Knowledge check for ${catalogLesson.title}`,
            passingScore: 70,
          },
          create: {
            lessonId: lesson.id,
            title: `${catalogLesson.title} Quiz`,
            description: `Knowledge check for ${catalogLesson.title}`,
            passingScore: 70,
          },
        });

        await prisma.quizQuestion.deleteMany({
          where: {
            quizId: quiz.id,
          },
        });

        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            prompt: catalogLesson.quiz.question,
            choices: catalogLesson.quiz.choices,
            correctIndex: catalogLesson.quiz.correctIndex,
            explanation: catalogLesson.quiz.explanation,
            sortOrder: 1,
          },
        });
      }
    }

    console.log(`  ${catalogCourse.lessons.length} lessons`);
  }

  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.lesson.count();
  const quizCount = await prisma.quiz.count();
  const quizQuestionCount = await prisma.quizQuestion.count();

  console.log("");
  console.log("Seed complete.");
  console.log(`Courses in PostgreSQL: ${courseCount}`);
  console.log(`Lessons in PostgreSQL: ${lessonCount}`);
  console.log(`Quizzes in PostgreSQL: ${quizCount}`);
  console.log(`Quiz questions in PostgreSQL: ${quizQuestionCount}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
