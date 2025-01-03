import { useEffect, useState, useCallback } from 'react';
import { savePdf, getAllPdfs, deletePdf } from '../services/idbService';
import { PdfHistoryItem } from '../types/app';
import { generatePdfName } from '../helpers/generatePdfName';

export const usePdfHistory = () => {
  const [history, setHistory] = useState<PdfHistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const pdfs = await getAllPdfs();
      const formattedHistory = pdfs.map((item) => ({
        ...item,
        blobUrl: URL.createObjectURL(item.blob),
      }));
      setHistory(formattedHistory);
    };

    fetchHistory();
  }, []);

  const addPdf = useCallback(
    async (text: string, blob: Blob): Promise<PdfHistoryItem> => {
      const id = crypto.randomUUID();
      const name = generatePdfName(text);
      const createdAt = new Date().toISOString();

      const newItem: PdfHistoryItem = {
        id,
        name,
        text,
        createdAt,
        blobUrl: URL.createObjectURL(blob),
        blob,
      };

      await savePdf(newItem);

      setHistory((prev) => [...prev, newItem]);

      return newItem;
    },
    []
  );

  const removePdf = useCallback(async (id: string) => {
    await deletePdf(id);

    setHistory((prev) => {
      const updatedHistory = prev.filter((item) => item.id !== id);

      const removedItem = prev.find((item) => item.id === id);
      if (removedItem) {
        URL.revokeObjectURL(removedItem.blobUrl);
      }

      return updatedHistory;
    });
  }, []);

  return { history, addPdf, removePdf };
};
