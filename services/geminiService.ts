
// Google GenAI paketi kaldırıldı.
// Bu dosya artık sadece yer tutucu (placeholder) olarak işlev görüyor.

export const analyzeBusinessData = async (
  contextData: string, 
  userPrompt: string
): Promise<string> => {
  return "Yapay zeka asistanı şu anda devre dışıdır.";
};

export const generateInvoiceNote = async (customerName: string, items: string, total: number): Promise<string> => {
  // AI yerine standart bir metin döndürür
  return `Sayın ${customerName}, alışverişiniz için teşekkür ederiz. İşbirliğimizin devamını dileriz.`;
}
