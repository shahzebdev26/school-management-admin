import { SchoolDetail } from '@/features/schools/components/school-detail'

interface SchoolDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { id } = await params
  return <SchoolDetail id={id} />
}
