import { diagnoseDevice } from './services/backendServices';

export async function testDiagnosis() {
  try {
    console.log('Testing backend connection...');
    
    const result = await diagnoseDevice(
      'Laptop',
      ['won\'t turn on', 'black screen'],
      [], // no images for now
      undefined // no location
    );
    
    console.log('Backend response:', result);
    return result;
  } catch (error) {
    console.error('Backend test failed:', error);
    throw error;
  }
}