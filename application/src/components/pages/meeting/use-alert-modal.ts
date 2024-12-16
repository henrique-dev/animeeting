import { useState } from 'react';

export const useAlertModal = () => {
  const [isModalAlertNameOpen, setIsModalAlertNameOpen] = useState(false);
  const [isModalRequireCameraNameOpen, setIsModalRequireCameraNameOpen] = useState(false);

  return { isModalAlertNameOpen, isModalRequireCameraNameOpen, setIsModalAlertNameOpen, setIsModalRequireCameraNameOpen };
};
