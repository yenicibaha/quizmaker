import React, { useState } from "react";
import mammoth from "mammoth";

const OPENAI_API_KEY = "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";

const App = () => {
  const [wordContent, setWordContent] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Word dosyasını işleme ve metnini alma
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file || !file.name.endsWith(".docx")) {
      alert("Lütfen geçerli bir Word dosyası yükleyin!");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Word dosyasını metne dönüştürmek için Mammoth kullanıyoruz
      const { value } = await mammoth.extractRawText({ arrayBuffer });

      const cleanedContent = value.replace(/[^\x20-\x7E]/g, ""); // Temiz metin oluştur

      setWordContent(cleanedContent);

      const questions = await generateQuizQuestions(cleanedContent);
      setQuizQuestions(questions);

    } catch (error) {
      console.error("Dosya işleme sırasında bir hata oluştu:", error.message);
    }
  };

  // OpenAI API'sine içerik göndererek quiz soruları oluşturma (fetch kullanımı)
 const generateQuizQuestions = async (content) => {
  try {
    console.log("Gönderilen Metin:", content);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Aşağıdaki metni kullanarak quiz soruları oluştur:\n\n${content}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API çağrısı başarısız: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Yanıtı:", JSON.stringify(data, null, 2)); // API yanıtını detaylı olarak yazdır

    const generatedQuestions = data.choices?.[0]?.message?.content?.split("\n") || [];
    console.log("Oluşturulan Sorular:", generatedQuestions);

    return generatedQuestions;

  } catch (error) {
    console.error("GPT API çağrısında bir hata:", error.message);
    return [];
  }
};

  return (
    <div>
      <h2>Word Dosyasını Yükle</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />

      <h3>Quiz Soruları</h3>
      {quizQuestions.length > 0 ? (
        <ul>
          {quizQuestions.map((question, index) => (
            <li key={index}>{index + 1}. {question}</li>
          ))}
        </ul>
      ) : (
        <p>Quiz soruları oluşturulmadı.</p>
      )}

      <h3>Word Dosyasındaki İçerik</h3>
      <textarea rows="10" cols="80" value={wordContent} readOnly />
    </div>
  );
};

export default App;
