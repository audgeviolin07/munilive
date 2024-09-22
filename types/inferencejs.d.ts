declare module "inferencejs" {
    export class InferenceEngine {
      constructor();
      startWorker(modelName: string, version: number, apiKey: string): Promise<string>;
      infer(workerId: string, image: CVImage): Promise<any[]>;
    }
  
    export class CVImage {
      constructor(videoElement: HTMLVideoElement);
    }
  }
  