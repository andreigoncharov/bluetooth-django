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

class BluetoothAPI{


    // Инициализация
    constructor(){
    this.deivce_address = ""
    }

    // Метод для поиска
    async onButtonClick_BLE_connect() {
        mode = true;
        const DEVICE_CONTROL_SERVICE_UUID = "0b366e80-cf3a-11e1-9ab4-0002a5d5c51b";
        const DEVICE_CONTROL_CHARACTERISTIC_UUID = "0c366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    
        const LOG_SERVICE_UUID = "01366e80-cf3a-11e1-9ab4-0002a5d5c51b";
        const LOG_DATA_CHARACTERISTIC_UUID = "03366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    
        debug( 'Requesting Bluetooth Device...' );
        //options.acceptAllDevices = true; //ALL ACCEPTED
        try {
            device = await navigator.bluetooth.requestDevice( { filters: [{ name: "EMG" }],
                optionalServices: [ DEVICE_CONTROL_SERVICE_UUID, LOG_SERVICE_UUID ] } );
    
            debug( '> Name:             ' + device.name );
            debug( '> Id:               ' + device.id );
            debug( '> Connected:        ' + device.gatt.connected );
    
            device.addEventListener( 'gattserverdisconnected', onDisconnected );
    
            debug( 'Connecting to GATT Server...' );
            const server = await device.gatt.connect();
            debug( 'Connected:' + server.connected );
    
            //write settings...
            S = DEVICE_CONTROL_SERVICE_UUID;
            debug( "Getting [" + S + "] servise..." );
            const settings_service = await server.getPrimaryService( S );
    
            C = DEVICE_CONTROL_CHARACTERISTIC_UUID;
            debug( "Getting [" + C + "] haracteristic..." );
            const settings_characteristic = await settings_service.getCharacteristic( C );
    
            var buffer = new ArrayBuffer( 9 );
            buffer[ 0 ] = 0;
            buffer[ 1 ] = 0;
            // buffer[ 2 ] = 4; //Gain
            // buffer[ 3 ] = 3; //FilterFreq
            // buffer[ 4 ] = 0; //NoiseLvlOut
            // buffer[ 5 ] = 0; //NoiseLvlIn
            // buffer[ 6 ] = 33; //SlideAverage
            // buffer[ 7 ] = 29; //AverageMS
            buffer[ 2 ] = document.getElementById('gain').value; //Gain
            buffer[ 3 ] = document.getElementById('filterFreq').value;; //FilterFreq
            buffer[ 4 ] = document.getElementById('noiseLvlOut').value;; //NoiseLvlOut
            buffer[ 5 ] = document.getElementById('noiseLvlIn').value;; //NoiseLvlIn
            buffer[ 6 ] = document.getElementById('slideAverage').value;; //SlideAverage
            buffer[ 7 ] = document.getElementById('averageMS').value;; //AverageMS
            buffer[ 8 ] = 0;
            debug( 'Gain ' +  document.getElementById('gain').value);
            debug( 'Writing data...' );
            const status_write = await settings_characteristic.writeValue( buffer );
    
            //read data...
            S = LOG_SERVICE_UUID;
            debug( "Getting [" + S + "] servise..." );
            data_service = await server.getPrimaryService( S );
    
            C = LOG_DATA_CHARACTERISTIC_UUID;
            debug( "Getting [" + C + "] haracteristic..." );
            data_characteristic = await data_service.getCharacteristic( C );
    
            // get our data...
            data_characteristic.addEventListener( 'characteristicvaluechanged', handleCharacteristicValueChanged );
            await data_characteristic.startNotifications();
    
        } catch(error)  {
            debug( 'Argh! ' + error );
        }
    }

    name(value) {
        const MAX_SIZE = 2;
        let buffer = [];
        var value = 0;

        if(value != -1){
            let new_buffer = [];
            if (buffer.length == MAX_SIZE+1){
                new_buffer = [buffer[1], buffer[2], value];
                buffer = new_buffer;
            }
            else if (buffer.length < MAX_SIZE+1){
                buffer.push(value);
            }
            var new_value = (buffer.map(i=>x+=i, x=0).reverse()[0])/buffer.length;
            value = Math.round(new_value);
            return value;
        }
        return 0;
        
    }

    // Метод для подключения

    // Метод для получения данных

    // Метод для передачи в Django

    // Метод для отключения
}