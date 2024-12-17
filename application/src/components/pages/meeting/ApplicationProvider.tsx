import React, { useCallback, useState } from 'react';

export type UserType = {
  id: string;
  name: string;
  state: 'connecting' | 'connected';
};

type ApplicationContextProps = {
  meetingId: string;
  currentUsers: UserType[];
  addUser: (user: UserType) => void;
  updateUser: (user: UserType) => void;
  removeUser: (user: UserType) => void;
};

export const ApplicationContext = React.createContext<ApplicationContextProps>({
  meetingId: '',
  currentUsers: [],
  addUser: () => undefined,
  updateUser: () => undefined,
  removeUser: () => undefined,
});

type ApplicationProviderProps = {
  meetingId: string;
  children: React.ReactNode;
};

export const ApplicationProvider = ({ meetingId, children }: ApplicationProviderProps) => {
  const [currentUsers, setCurrentUsers] = useState<UserType[]>([]);

  const addUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => {
        if (oldUsers.find((userToFInd) => userToFInd.id === user.id)) {
          return [...oldUsers];
        } else {
          return [...oldUsers, user];
        }
      });
    },
    [setCurrentUsers]
  );

  const updateUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => {
        const newUsers = [...oldUsers];
        const userIndex = newUsers.findIndex((userToFInd) => userToFInd.id === user.id);
        if (userIndex >= 0) {
          newUsers[userIndex] = {
            ...newUsers[userIndex],
            ...user,
          };
        }
        return newUsers;
      });
    },
    [setCurrentUsers]
  );

  const removeUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => oldUsers.filter((oldUser) => oldUser.id !== user.id));
    },
    [setCurrentUsers]
  );

  return (
    <ApplicationContext.Provider
      value={{
        meetingId,
        currentUsers,
        addUser,
        updateUser,
        removeUser,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
