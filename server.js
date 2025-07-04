let rawResponse = {};
const backUp_Api = `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`;

document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.toggle("hidden");
});

document.getElementById("scrapeBtn").addEventListener("click", async () => {
  const jobId = document.getElementById("jobId").value.trim();
  const jobUrl = document.getElementById("jobUrl").value.trim();
  const outputBox = document.getElementById("output");
  let apiKey = document.getElementById("apiKey").value.trim();
  const model = document.getElementById("modelSelect").value;
  const currentYear = new Date().getFullYear();

  if (!jobId || !jobUrl) {
    outputBox.textContent = "⚠️ Please enter both Job ID and Job URL.";
    return;
  }

  if (!apiKey) {
    apiKey = backUp_Api;
  }

  try {
    outputBox.textContent = "⏳ Fetching job details...";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert job content scraper."
          },
          {
            role: "user",
            content: `Scrape the following Naukri job URL:\n\nURL: ${jobUrl}\n\nFormat:\nTLJOB${currentYear}${jobId}\nCompany name:\nPosition:\nExperience:\nLocation:\nSkills:\nLink: ${jobUrl}\nEmail:\n\nIf the field is not available, return "N/A".`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    rawResponse = data;

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response format from API");
    }

    outputBox.textContent = `✅ Parsed Output:\n\n${content}`;
  } catch (err) {
    outputBox.textContent = `❌ Error: ${err.message}`;
  }
});

document.getElementById("downloadText").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "job-info.txt";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("downloadJSON").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(rawResponse, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "job-response.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("clearOutput").addEventListener("click", () => {
  document.getElementById("output").textContent = "Parsed job data will appear here...";
  rawResponse = {};
});
