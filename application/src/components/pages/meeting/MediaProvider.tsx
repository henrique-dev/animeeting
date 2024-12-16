import React, { useRef } from 'react';

type MediaContextProps = {
  localStreamRef: React.RefObject<MediaStream | null>;
  localScreenStreamRef: React.RefObject<MediaStream | null>;
};

export const MediaContext = React.createContext<MediaContextProps>({
  localStreamRef: { current: null },
  localScreenStreamRef: { current: null },
});

type MediaProviderProps = {
  children: React.ReactNode;
};

export const MediaProvider = ({ children }: MediaProviderProps) => {
  const localStreamRef = useRef<MediaStream>(null);
  const localScreenStreamRef = useRef<MediaStream>(null);

  return (
    <MediaContext.Provider
      value={{
        localStreamRef,
        localScreenStreamRef,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
