import { pipeline, env } from "@xenova/transformers";

class MyClassificationPipeline {
  static task = "text-classification";
  static model = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // env.cacheDir = './.cache';  // nếu muốn cache model
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

// Load trước khi server khởi động (tăng tốc request đầu tiên)
MyClassificationPipeline.getInstance();

export default MyClassificationPipeline;
