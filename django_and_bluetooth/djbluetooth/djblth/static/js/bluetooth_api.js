class BluetoothConstants{

	constructor(){
		this.DEVICE_NAME = "SNOR"  
    	this.LOG_DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb";
    	this.LOG_SERVICE_UUID = "01366e80-cf3a-11e1-9ab4-0002a5d5c51b";	
    	this.LOG_DATA_CHARACTERISTIC_UUID = "03366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.LOG_STATUS_CHARACTERISTIC_UUID = "02366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.DEVICE_CONTROL_SERVICE_UUID = "0b366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.DEVICE_CONTROL_CHARACTERISTIC_UUID = "0c366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.FIRMWARE_SERVICE_UUID = "04366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.FIRMWARE_DATA_CHARACTERISTIC_UUID = "05366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.FIRMWARE_PAGE_STATUS_CHARACTERISTIC_UUID = "06366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.FIRMWARE_STATE_CHARACTERISTIC_UUID = "07366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	this.CLIENT_CHARACTERISTIC_CONFIGURATION_DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb";
	}
}

export default class BluetoothAPI{
    // Инициализация
    constructor(){
    this.device = null;
    this.server = null;
    this.settings_characteristic = null;
    this.settings_service = null;
    this.data_service = null;
    this.data_characteristic = null;
    this.bluetoothConstants = BluetoothConstants();

    this.buffer = [];
    }

    // Метод для поиска
    async connectToBLEDevice() {
        mode = true;
    
        //options.acceptAllDevices = true; //ALL ACCEPTED
        try {
            this.device = await navigator.bluetooth.requestDevice( { filters: [{ name: this.bluetoothConstants.DEVICE_NAME }],
                optionalServices: [ this.bluetoothConstants.DEVICE_CONTROL_SERVICE_UUID, this.bluetoothConstants.LOG_SERVICE_UUID ] } );
    
            // debug( '> Name:             ' + device.name );
            // debug( '> Id:               ' + device.id );
            // debug( '> Connected:        ' + device.gatt.connected );
    
            device.addEventListener( 'gattserverdisconnected', onDisconnected );
    
            this.server = await device.gatt.connect();
    
            //write settings...
            S = this.bluetoothConstants.DEVICE_CONTROL_SERVICE_UUID;
            this.settings_service = await this.server.getPrimaryService( S );
    
            C = this.bluetoothConstants.DEVICE_CONTROL_CHARACTERISTIC_UUID;
            this.settings_characteristic = await this.settings_service.getCharacteristic( C );
    
            var buffer = new ArrayBuffer( 9 );
            buffer[ 0 ] = 0;
            buffer[ 1 ] = 0;
            buffer[ 2 ] = 1 // document.getElementById('gain').value; //Gain
            buffer[ 3 ] = 0 // document.getElementById('filterFreq').value;; //FilterFreq
            buffer[ 4 ] = 0 // document.getElementById('noiseLvlOut').value;; //NoiseLvlOut
            buffer[ 5 ] = 0 // document.getElementById('noiseLvlIn').value;; //NoiseLvlIn
            buffer[ 6 ] = 0 // document.getElementById('slideAverage').value;; //SlideAverage
            buffer[ 7 ] = 0 // document.getElementById('averageMS').value;; //AverageMS
            buffer[ 8 ] = 0;
            const status_write = await this.sendDataToDevice(buffer);
    
            //read data...
            S = this.bluetoothConstants.LOG_SERVICE_UUID;
            this.data_service = await this.server.getPrimaryService( S );
    
            C = this.bluetoothConstants.LOG_DATA_CHARACTERISTIC_UUID;
            this.data_characteristic = await this.data_service.getCharacteristic( C );
    
            // get our data...
            this.data_characteristic.addEventListener( 'characteristicvaluechanged', handleCharacteristicValueChanged );
            await this.data_characteristic.startNotifications();
    
        } catch(error)  {
            // debug( 'Argh! ' + error );
        }
    }

    // Метод отправки данных на подключенное устройство
    async sendDataToDevice(dataToSend){
        if(this.device.gatt.connected){
            this.settings_characteristic.writeValue( dataToSend );
        }
    }
    
    // Метод, срабатывающий при получении значения от устройства
    handleCharacteristicValueChanged( event ) {
        processData( event.target.value );
    }

    // Обработка полученного числа(перевод и усреднение)
    processData(n_value){
        n_value = n_value.getInt16(0,true);

        const MAX_SIZE = 2;
        var value = 0;
    
        if(value != -1){
            let new_buffer = [];
            if (buffer.length == MAX_SIZE+1){
                new_buffer = [buffer[1], buffer[2], n_value];
                buffer = new_buffer;
            }
            else if (buffer.length < MAX_SIZE+1){
                buffer.push(n_value);
            }
            var new_value = (buffer.map(i=>x+=i, x=0).reverse()[0])/buffer.length;
            value = Math.round(new_value);
            try{
                buffer[buffer.length -1] = value;
            }
            catch (e) { }
            return value;
        }
        return 0;
    }

    // Метод для отключения
    disconnectFromDevice(){
        if (this.device.gatt.connected) {
            this.device.gatt.disconnect();
          } else {
            log('> Bluetooth Device is already disconnected');
          }
    }
}