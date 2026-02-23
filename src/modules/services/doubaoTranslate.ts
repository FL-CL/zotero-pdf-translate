// src/modules/services/doubaoTranslate.ts
import { getPref } from "../../utils/prefs";
import { TranslationService } from "../../types";

export const DoubaoTranslate: TranslationService = {
  id: "doubao-seed-translation",
  type: "translation",
  name: "Doubao Seed Translation (Volcengine)",
  helpUrl: "https://www.volcengine.com/docs/82379/1263281-doubao-seed-translation-250915",

  defaultSecret: "",

  secretValidator: (secret: string) => {
    if (!secret) return "请输入 Volcano Ark API Key";
    return undefined;
  },

  config: (settings) => {
    settings
      .addTextSetting({
        prefKey: "doubao.baseUrl",
        nameKey: "service.doubao.baseUrl",
        defaultValue: "https://ark.cn-beijing.volces.com/api/v3/responses",
      })
      .addTextSetting({
        prefKey: "doubao.model",
        nameKey: "service.doubao.model",
        defaultValue: "ep-xxxxxxxx", // 替换为你的 ep- ID
      });
  },

  async translate(data) {
    const baseUrl = getPref("doubao.baseUrl") || "https://ark.cn-beijing.volces.com/api/v3/responses";
    const model = getPref("doubao.model") || "doubao-seed-translation-250915";
    const apiKey = data.secret;

    if (!apiKey) throw new Error("请设置 Volcano Ark API Key");

    const url = baseUrl.replace(/\/+$/, "");

    const payload = {
      model,
      messages: [{ role: "user", content: data.text }], // 简化到单 user message
      translation_options: {
        source_language: data.from || "auto", // 源语言，auto 检测
        target_language: data.to, // 目标语言
      },
      // 无 temperature 等通用参数
    };

    const xhr = await Zotero.HTTP.request("POST", url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      responseType: "json",
    });

    if (xhr.status !== 200) {
      const err = xhr.response?.error?.message || xhr.responseText;
      throw new Error(`Doubao API 错误 (${xhr.status}): ${err}`);
    }

    const result = xhr.response.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error("未能解析翻译结果");

    data.result = result;
  },
};
