import React, { useState } from 'react';

type PropertiesType = {
  state: 'idle' | 'negotiating' | 'progress' | 'complete';
  video: boolean;
  audio: boolean;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  haveMedia: boolean;
};

type MeetingContextProps = {
  properties: PropertiesType;
  setProperties: React.Dispatch<React.SetStateAction<PropertiesType>>;
};

export const MeetingContext = React.createContext<MeetingContextProps>({
  properties: {
    state: 'idle',
    video: false,
    audio: false,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
    haveMedia: false,
  },
  setProperties: () => undefined,
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const [properties, setProperties] = useState<PropertiesType>({
    state: 'idle',
    video: false,
    audio: false,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
    haveMedia: false,
  });

  return <MeetingContext.Provider value={{ properties, setProperties }}>{children}</MeetingContext.Provider>;
};
