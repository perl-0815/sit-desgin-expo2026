import { prisma } from "@/lib/prisma"

// 이미지 URL 필드는 제외하고 표시하기 위해 필터링
const omitImageFields = <T extends Record<string, unknown>>(row: T) => {
  const entries = Object.entries(row).filter(
    ([key]) =>
      !key.includes("image_url") &&
      !key.includes("image_thumb_url") &&
      !key.includes("image1_url") &&
      !key.includes("image1_thumb_url") &&
      !key.includes("image2_url") &&
      !key.includes("image2_thumb_url"),
  )
  return Object.fromEntries(entries)
}

export default async function TestPage() {
  // 각 테이블의 총 건수를 확인
  const [labCount, studentCount, careerCount, portfolioCount, researchCount] =
    await Promise.all([
      prisma.lab.count(),
      prisma.student.count(),
      prisma.career.count(),
      prisma.portfolio.count(),
      prisma.research.count(),
    ])

  // 이미지 필드 외 모든 값을 확인하기 위해 전체를 가져옴
  const [labs, students, careers, portfolios, research] = await Promise.all([
    prisma.lab.findMany({ include: { students: true }, orderBy: { id: "asc" } }),
    prisma.student.findMany({
      include: { lab: true, careers: true, portfolios: true, research: true },
      orderBy: { id: "asc" },
    }),
    prisma.career.findMany({ include: { student: true }, orderBy: { id: "asc" } }),
    prisma.portfolio.findMany({
      include: { student: true },
      orderBy: { id: "asc" },
    }),
    prisma.research.findMany({
      include: { student: true },
      orderBy: { id: "asc" },
    }),
  ])

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>DB Test</h1>
      <p>
        Labs: {labCount} / Students: {studentCount} / Careers: {careerCount} /
        Portfolios: {portfolioCount} / Research: {researchCount}
      </p>

      <section>
        <h2>Labs (all)</h2>
        {labs.map((lab) => (
          <details key={lab.id} style={{ marginBottom: 12 }}>
            <summary>
              {lab.id} - {lab.name} (students: {lab.students.length})
            </summary>
            <pre>{JSON.stringify(omitImageFields(lab), null, 2)}</pre>
          </details>
        ))}
      </section>

      <section>
        <h2>Students (all)</h2>
        {students.map((student) => (
          <details key={student.id} style={{ marginBottom: 12 }}>
            <summary>
              {student.id} - {student.name} (lab: {student.lab?.name ?? "—"})
            </summary>
            <pre>{JSON.stringify(omitImageFields(student), null, 2)}</pre>
          </details>
        ))}
      </section>

      <section>
        <h2>Careers (all)</h2>
        {careers.map((career) => (
          <details key={career.id} style={{ marginBottom: 12 }}>
            <summary>
              {career.id} - {career.category ?? "—"} (student:{" "}
              {career.student?.name ?? "—"})
            </summary>
            <pre>{JSON.stringify(omitImageFields(career), null, 2)}</pre>
          </details>
        ))}
      </section>

      <section>
        <h2>Portfolios (all)</h2>
        {portfolios.map((portfolio) => (
          <details key={portfolio.id} style={{ marginBottom: 12 }}>
            <summary>
              {portfolio.id} - {portfolio.title1 ?? "—"} (student:{" "}
              {portfolio.student?.name ?? "—"})
            </summary>
            <pre>{JSON.stringify(omitImageFields(portfolio), null, 2)}</pre>
          </details>
        ))}
      </section>

      <section>
        <h2>Research (all)</h2>
        {research.map((item) => (
          <details key={item.id} style={{ marginBottom: 12 }}>
            <summary>
              {item.id} - {item.title ?? "—"} (student:{" "}
              {item.student?.name ?? "—"})
            </summary>
            <pre>{JSON.stringify(omitImageFields(item), null, 2)}</pre>
          </details>
        ))}
      </section>
    </main>
  )
}
