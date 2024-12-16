import { SocketIoProvider } from '@/providers/SocketIoProvider';

type MeetingsLayoutProps = {
  children: React.ReactNode;
};

const MeetingsLayout = ({ children }: MeetingsLayoutProps) => {
  return <SocketIoProvider>{children}</SocketIoProvider>;
};

export default MeetingsLayout;
