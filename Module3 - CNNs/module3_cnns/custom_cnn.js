//
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 64;
const IMAGE_CHANNELS = 4;
const options = {
  task: 'imageClassification',
  inputs:[IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
  outputs: ['label']
}
const nn = ml5.neuralNetwork(options);


layers = [
    {
      type: 'conv2d',
      filters: 8,
      kernelSize: 5,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    },
    {
      type: 'maxPooling2d',
      poolSize: [2, 2],
      strides: [2, 2],
    },
    {
      type: 'conv2d',
      filters: 16,
      kernelSize: 5,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    },
    {
      type: 'maxPooling2d',
      poolSize: [2, 2],
      strides: [2, 2],
    },
    {
      type: 'flatten',
    },
    {
      type: 'dense',
      kernelInitializer: 'varianceScaling',
      activation: 'softmax',
    },
  ];
  
