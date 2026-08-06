import jsPDF from "jspdf";

export interface QuizReportData {
  userName: string;
  userEmail?: string;
  courseTitle: string;
  lessonTitle: string;
  quizTitle: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  awardedXp: number;
  date: string;
  questions: Array<{
    prompt: string;
    choices: string[];
    userAnswerIndex: number;
    correctIndex: number;
    explanation?: string | null;
  }>;
}

export function exportQuizPDF(data: QuizReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(30, 30, 40);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo / Title
  doc.setTextColor(240, 200, 50); // AfroKernel Yellow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AfroKernel", 15, 20);

  doc.setTextColor(200, 200, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Linux Administration Learning Platform — Completed Quiz Report", 15, 28);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Date: ${data.date}`, pageWidth - 15, 20, { align: "right" });

  y = 50;

  // Learner Info Block
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3, "F");

  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Learner: ${data.userName} ${data.userEmail ? `(${data.userEmail})` : ""}`, 20, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Course: ${data.courseTitle}`, 20, y + 18);
  doc.text(`Lesson: ${data.lessonTitle}`, 20, y + 26);

  // Score Badge
  if (data.passed) {
    doc.setFillColor(46, 125, 50); // Green
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setFillColor(198, 40, 40); // Red
    doc.setTextColor(255, 255, 255);
  }
  doc.roundedRect(pageWidth - 65, y + 8, 45, 20, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Score: ${data.score}%`, pageWidth - 42.5, y + 16, { align: "center" });
  doc.setFontSize(8);
  doc.text(`${data.correct} / ${data.total} Correct (${data.passed ? "PASSED" : "FAILED"})`, pageWidth - 42.5, y + 23, { align: "center" });

  y += 45;

  // Summary Pills
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 90);
  doc.text(`Quiz Title: ${data.quizTitle}`, 15, y);
  doc.text(`XP Earned: +${data.awardedXp} XP`, pageWidth - 15, y, { align: "right" });

  y += 10;
  doc.setDrawColor(220, 220, 230);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Questions breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 40);
  doc.text("Detailed Question Results:", 15, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  data.questions.forEach((q, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const isCorrect = q.userAnswerIndex === q.correctIndex;

    // Question Box
    doc.setFillColor(isCorrect ? 240 : 255, isCorrect ? 248 : 240, isCorrect ? 240 : 240);
    doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(isCorrect ? 35 : 180, isCorrect ? 100 : 40, isCorrect ? 40 : 40);
    doc.text(`${idx + 1}. [${isCorrect ? "CORRECT" : "INCORRECT"}] ${q.prompt}`, 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 70);
    const userChoiceText = q.choices[q.userAnswerIndex] ?? "No answer";
    const correctChoiceText = q.choices[q.correctIndex] ?? "";

    doc.text(`Your Answer: ${userChoiceText}`, 18, y + 13);
    if (!isCorrect) {
      doc.setTextColor(46, 125, 50);
      doc.text(`Correct Answer: ${correctChoiceText}`, 18, y + 19);
    } else if (q.explanation) {
      doc.setTextColor(100, 100, 110);
      doc.text(`Note: ${q.explanation}`, 18, y + 19);
    }

    y += 28;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text(`AfroKernel Learner Certificate & Report — Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: "center" });
  }

  const safeFilename = `${data.courseTitle}-${data.lessonTitle}-Quiz-Report.pdf`.replace(/[^a-z0-9]/gi, "_");
  doc.save(safeFilename);
}
