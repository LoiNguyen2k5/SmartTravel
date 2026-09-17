import axiosClient from './axiosClient';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const contactService = {
  sendContactMessage: async (data: ContactFormData) => {
    return await axiosClient.post('/contact', {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });
  },
};
