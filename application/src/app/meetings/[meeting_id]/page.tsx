import { MeetingPage } from '@/components/pages/meeting';

const Page = async ({ params }: { params: Promise<{ meeting_id: string }> }) => {
  const { meeting_id } = await params;

  return <MeetingPage meetingId={meeting_id} />;
};

export default Page;
