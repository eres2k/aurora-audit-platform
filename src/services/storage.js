import supabase from './db';
import imageCompression from 'browser-image-compression';

export const uploadFile = async (file, auditId) => {
  const options = { quality: 0.6, maxWidthOrHeight: 1920 };
  const compressedFile = await imageCompression(file, options);
  const fileName = `${auditId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, compressedFile);
  if (error) throw error;
  return data.path;
};

export const getFile = async (path) => {
  const { data } = supabase.storage.from('attachments').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path) => {
  const { error } = await supabase.storage.from('attachments').remove([path]);
  if (error) throw error;
};
