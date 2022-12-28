function include(file) { 
  
    var script  = document.createElement('script'); 
    script.src  = file; 
    script.type = 'text/javascript'; 
    script.defer = true; 
    
    document.getElementsByTagName('head').item(0).appendChild(script); 
    
} 

include('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js');



/**
 * Класс для описания упражнения
 */
class Exercise{

    /**
     * 
     * @param {*} countBollards количество рабочих столбцов
     * @param {*} bollardSeconds длительность одного рабочего столбца (в секундах)
     * @param {*} secondsBeforeFirstBollard количество секунд до первого столбца
     * @param {*} secondsAfterLastBollard количество секунд после последнего столбца (если этот промежуток не нужен, тогда просто указать значение 0)
     * @param {*} events события в упраженении. Пример описания события: {time:время в миллискундах когда должно выполниться событие, 
     *                                                                      function:функция для выполнения, functionParameters: параметры функции для выполнения},
     */
    constructor(countBollards, bollardSeconds, secondsBeforeFirstBollard, secondsAfterLastBollard, events){
        this.countBollards = countBollards; // количество столбиков для работы
        this.bollardSeconds = bollardSeconds; // длительность робочего столбца в секундах
        this.secondsBeforeFirstBollard = secondsBeforeFirstBollard; // количество секунд до первого столбца
        this.secondsAfterLastBollard = secondsAfterLastBollard; // количество секунд после последнего столбца

        this.events = events; // События в упражнении
    };

    
    recountEventsTimes(){
        var totalTime = 0;
        for(var i=1;i<this.events.length;i++){
            if(i==1){
                if((this.secondsBeforeFirstBollard*1000)-500 > 0)
                    this.events[i].time = (this.secondsBeforeFirstBollard*1000) - 500;
                    totalTime = secondsBeforeFirstBollard*1000;
            }
            else if(i == this.events.length-1){
                this.events[i].time = totalTime+secondsAfterLastBollard*1000;
            }
            else{
                totalTime += this.bollardSeconds*1000;
                if (i%2!= 0){
                    this.events[i].time = totalTime - 500;
                }
                else{
                    this.events[i].time = totalTime;
                }
            }
        }
        console.log(this.events);
    };
}

/**
 * Класс с константами
 */
class Constants{
    /**
     * Конструктор класса
     */
    constructor(){
        this.FREQUENCY_RECEIVING_DATA = 14;
    }
}

/**
 * Класс для работы с графиком
 */
class ChartManager{
    /**
     * Конструктор класса
     * @param {*} parentView родительский элемент
     */
    constructor(parentView){
        this.parent = parentView;
        var ctx = parentView.getContext('2d');
        this.chartView = null;
        this.chartXData = ["",];
        this.chartYData = [0,];
        this.chartData = {labels: [], datasets: []};
        this.createChartView();
        this.buffer = [];
    }
    
    /**
     * Метод создания графика
     */
    createChartView(){
        this.chartView = new Chart(this.parent.getContext('2d'), {
            type: 'line',
            options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                        point:{
                            radius: 0
                        }
                    },
            legend:
            {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                    drawBorder: false,
                        display:false
                    },
                    ticks: {
                        display: false,
                        // autoSkip: true,
                        // maxTicksLimit: 20
                    }
                }],
                yAxes: [{
                    gridLines: {
                    drawBorder: false,
                        display:false
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true,
                        max: 1024,
                        min: 0
                    }
                }]
            },
            },
            data: this.chartData,
        });
        var dataset = {
            backgroundColor:'rgb(255, 99, 132)',
            borderColor:'rgb(255, 99, 132)',
            data: [],
        };
        this.chartData.labels = this.chartXData
        dataset.data = this.chartYData;
        this.chartView.data.datasets.push(dataset);
	    this.chartView.update();
    }

    /**
     * Добавление значения на график
     * 
     * @param {*} new_value значение по оси Y
     */
    addNewValue(new_value){        
        try {
            this.chartView.data.datasets[0].data.length;
        }
        catch (e) {
            this.createChartView();
        }

        if(this.chartView.data.datasets[0].data.length != this.chartXData.length){
            // this.chartView.labels.push(new_);
            var processedValue = new_value;//this.processData(new_value);
            this.chartView.data.datasets[0].data.push(processedValue);
            this.chartView.update();
        }
    }

    /**
    * Обработка данных удаленного пользователя
    *
    * @param {*} new_value новое значение
    */
    processRemoteData(new_value){
        var d_length = 0;
        try {
            d_length = this.chartView.data.datasets[0].data.length;
        }
        catch (e) {
            this.createChartView();
            d_length = 0;
        }

        if(d_length == new_value.length){
            var processedValue = new_value[new_value.length - 1];
            this.chartView.data.datasets[0].data.push(processedValue);
            this.chartView.update();
        }
        else{
            for(var i = 0; i < new_value.length; i++){
                if(i >= d_length-1){
                    var processedValue = new_value[i];
                    this.chartView.data.datasets[0].data.push(processedValue);
                    this.chartView.update();
                }
            }
        }

    }

    /**
     * Метод для изменения ширины графика
     * @param {*} newMaxX новая ширина графика
     */
    setXMax(newMaxX){
        var newMaxData = [];
        for (let i = 0; i < newMaxX; i++) { 
            this.chartXData.push("");
        }
        this.chartView.update();
        // console.log(this.chartView.scales);
        // this.chartView.scales.xAxes[0].ticks.max = newMaxX;
    }

    generateRandomData(){
        for(let i=0;i<this.chartXData.length;i++){
            this.chartView.data.datasets[0].data.push((Math.floor(Math.random() * (1024 - 1)) + 1));
        }
        
    }

    /**
     * Очистка графика
     */
    clearChart(){
        this.chartView.clear();
        this.chartView.data.datasets[0].data = [];
        this.chartView.update();
    }
}

class ValueBuffer{
    constructor(){
        this.buffer = [];
    }
}

/**
 * Класс с константами для bluetooth устройства
 */
class BluetoothConstants{
    /**
     * Конструктор класса
     */
	constructor(){
		// this.DEVICE_NAME = "SNOR"  
    	// this.LOG_DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb";
    	// this.LOG_SERVICE_UUID = "01366e80-cf3a-11e1-9ab4-0002a5d5c51b";	
    	// this.LOG_DATA_CHARACTERISTIC_UUID = "03366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.LOG_STATUS_CHARACTERISTIC_UUID = "02366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.DEVICE_CONTROL_SERVICE_UUID = "0b366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.DEVICE_CONTROL_CHARACTERISTIC_UUID = "0c366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.FIRMWARE_SERVICE_UUID = "04366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.FIRMWARE_DATA_CHARACTERISTIC_UUID = "05366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.FIRMWARE_PAGE_STATUS_CHARACTERISTIC_UUID = "06366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.FIRMWARE_STATE_CHARACTERISTIC_UUID = "07366e80-cf3a-11e1-9ab4-0002a5d5c51b";
    	// this.CLIENT_CHARACTERISTIC_CONFIGURATION_DESCRIPTOR_UUID = "00002902-0000-1000-8000-00805f9b34fb";
        this.DEVICE_NAME = "EMG";
        this.DEVICE_CONTROL_SERVICE_UUID = "0b366e80-cf3a-11e1-9ab4-0002a5d5c51b";
	    this.DEVICE_CONTROL_CHARACTERISTIC_UUID = "0c366e80-cf3a-11e1-9ab4-0002a5d5c51b";
	    this.LOG_SERVICE_UUID = "01366e80-cf3a-11e1-9ab4-0002a5d5c51b";
	    this.LOG_DATA_CHARACTERISTIC_UUID = "03366e80-cf3a-11e1-9ab4-0002a5d5c51b";
	}
}

/**
 * Класс для работы с bluetooth устройством
 */
class BluetoothAPI{
    /**
     * Конструктор класса
     */
    constructor(bluetoothBuffer){
        this.device = null;
        this.server = null;
        this.settings_characteristic = null;
        this.settings_service = null;
        this.data_service = null;
        this.data_characteristic = null;
        this.bluetoothConstants = new BluetoothConstants();
        
        this.valuebuffer = new ValueBuffer();
        this.buffer = this.valuebuffer.buffer;
    }

    /**
     * Метод для поиска и подключения bluetooth устройства
     */
    async connectToBLEDevice() {    
        //options.acceptAllDevices = true; //ALL ACCEPTED
        try {
            this.device = await navigator.bluetooth.requestDevice( { filters: [{ name: this.bluetoothConstants.DEVICE_NAME }],
                optionalServices: [ this.bluetoothConstants.DEVICE_CONTROL_SERVICE_UUID, this.bluetoothConstants.LOG_SERVICE_UUID ] } );
    
    
            this.device.addEventListener( 'gattserverdisconnected', this.onDisconnected );
    
            this.server = await this.device.gatt.connect();
    
            //write settings...
            var S = this.bluetoothConstants.DEVICE_CONTROL_SERVICE_UUID;
            this.settings_service = await this.server.getPrimaryService( S );
    
            var C = this.bluetoothConstants.DEVICE_CONTROL_CHARACTERISTIC_UUID;
            this.settings_characteristic = await this.settings_service.getCharacteristic( C );
    
            var buffer = new ArrayBuffer( 9 );
            buffer[ 0 ] = 0;
            buffer[ 1 ] = 0;
            buffer[ 2 ] = document.getElementById('gain').value; //Gain
		    buffer[ 3 ] = document.getElementById('filterFreq').value;; //FilterFreq
		    buffer[ 4 ] = document.getElementById('noiseLvlOut').value;; //NoiseLvlOut
		    buffer[ 5 ] = document.getElementById('noiseLvlIn').value;; //NoiseLvlIn
		    buffer[ 6 ] = document.getElementById('slideAverage').value;; //SlideAverage
		    buffer[ 7 ] = document.getElementById('averageMS').value;; //AverageMS
            buffer[ 8 ] = 0;
            const status_write = await this.sendDataToDevice(buffer);
    
            //read data...
            S = this.bluetoothConstants.LOG_SERVICE_UUID;
            this.data_service = await this.server.getPrimaryService( S );
    
            C = this.bluetoothConstants.LOG_DATA_CHARACTERISTIC_UUID;
            this.data_characteristic = await this.data_service.getCharacteristic( C );
    
            // get our data...
            this.data_characteristic.addEventListener( 'characteristicvaluechanged', onvchanged );
            await this.data_characteristic.startNotifications();

            document.getElementById('bl_status').innerText = `Bluetooth status: connected`;
            document.getElementById('bl_data').innerText = `Bluetooth last data: -`;

    
        } catch(error)  {
            document.getElementById('bl_status').innerText = `Bluetooth status: Error : ${error}`;
            // debug( 'Argh! ' + error );
        }
    }

    /**
     * Метод для отправки данных на bluetooth устройство
     *
     * @param {*} dataToSend данные для отправки
     */
    async sendDataToDevice(dataToSend){
        if(this.device.gatt.connected){
            this.settings_characteristic.writeValue( dataToSend );
        }
    }
    
    /**
     * Обработка полученного числа(перевод и усреднение)
     * 
     * @param {*} n_value значение для обработки
     * @returns обработанное значение
     */
    processData(n_value){
        n_value = n_value.getInt16(0,true);

        const MAX_SIZE = 2;
        var value = 0;
    
        if(n_value != -1){
            let new_buffer = [];
            try{
                this.buffer.length;
            }
            catch (e){
                this.buffer = [];
            }

            if (buffer.length == MAX_SIZE+1){
                new_buffer = [buffer[1], buffer[2], n_value];
                buffer = new_buffer;
            }
            else if (buffer.length < MAX_SIZE+1){
                buffer.push(n_value);
            }
            var new_value = (this.buffer.reduce((acc, num) => acc + num, 0))/buffer.length;
            value = Math.round(new_value);
            try{
                buffer[buffer.length -1] = value;
            }
            catch (e) { }
            return value;
        }
        return 0;
    }

    /**
     * Метод, срабатывающий при получении посылки от bluetooth устройства
     * @param {*} event событие получения
     */
    handleCharacteristicValueChanged( event ) {
        // var val = this.processData(event.target.value);

        var n_value = event.target.value.getInt16(0,true);

        const MAX_SIZE = 2;
        var value = 0;
    
        if(n_value != -1){
            let new_buffer = [];
            if (this.buffer.length == MAX_SIZE+1){
                new_buffer = [this.buffer[1], this.buffer[2], n_value];
                this.buffer = new_buffer;
            }
            else if (this.buffer.length < MAX_SIZE+1){
                this.buffer.push(n_value);
            }
            var new_value = (this.buffer.reduce((acc, num) => acc + num, 0))/this.buffer.length;
            value = Math.round(new_value);
            try{
                this.buffer[this.buffer.length -1] = value;
            }
            catch (e) { }
            document.getElementById('bl_data').innerText = `Bluetooth last data: ${value}`;

        }
        document.getElementById('bl_data').innerText = `Bluetooth last data: ${n_value}`;
    }

    /**
     * Отключение от bluetooth устройства
     */
    disconnectFromDevice(){
        if (this.device.gatt.connected) {
            this.device.gatt.disconnect();
          } else {
            console.log('> Bluetooth Device is already disconnected');
          }
    }

    /**
     * Метод срабатывающий при отключении устройства
     * @param {*} event 
     */
    onDisconnected( event ) {
        // Object event.target is Bluetooth Device getting disconnected.
        document.getElementById('bl_status').innerText = `Bluetooth status: disconnected`;
    }
}

/**
 * Класс для работы со столбцами
 */
class BollardAManager{
    /**
     * Конструктор класса
     * 
     * @param {*} countBollards количество рабочих столбцов
     * @param {*} bollardSeconds длительность одного рабочего столбца (в секундах)
     * @param {*} secondsBeforeFirstBollard количество секунд до первого столбца
     * @param {*} secondsAfterLastBollard количество секунд после последнего столбца (если этот промежуток не нужен, тогда просто указать значение 0)
     */
    constructor(countBollards, bollardSeconds, secondsBeforeFirstBollard, secondsAfterLastBollard){
        this.countBollards = countBollards; // количество столбиков для работы
        this.bollardSeconds = bollardSeconds; // длительность робочего столбца в секундах
        this.secondsBeforeFirstBollard = secondsBeforeFirstBollard; // количество секунд до первого столбца
        this.secondsAfterLastBollard = secondsAfterLastBollard; // количество секунд после последнего столбца
        
        this.parent = null;
        this.context = null;
        this.startWidth = null;
    }

    /**
     * Метод расчета и создания столбцов
     * 
     * @param {*} parent элемент, в котором будут создаваться столбцы
     */
    createBollards(parent){
        this.parent = parent;
        this.context = parent.getContext('2d');
        
        this.deleteBollards();

        var context = this.context;
        var parent_width = parent.offsetWidth;
        if(this.startWidth == null){
            this.startWidth = parent.offsetWidth;
        }
        else{
            parent_width = this.startWidth;
        }

        var timeValue = this.getTimeValue(Number(parent_width));

        var marginLeft = 0;
        if(this.secondsBeforeFirstBollard != 0){
            this.drawBollard(context, "#D6D4D4", marginLeft, (this.secondsBeforeFirstBollard*timeValue), parent.offsetHeight);
            marginLeft += (this.secondsBeforeFirstBollard*timeValue);
        }
        for (let i = 0; i < ((this.countBollards*2)-1); i++) { 
            if (i%2 == 0){
                this.drawBollard(context, "#0955DC", marginLeft, (this.bollardSeconds*timeValue), parent.offsetHeight);
            }
            else{
                this.drawBollard(context, "#D6D4D4", marginLeft, (this.bollardSeconds*timeValue), parent.offsetHeight);
            }
            marginLeft += (this.bollardSeconds*timeValue);
        }
        if(this.secondsAfterLastBollard != 0){
            if(this.secondsAfterLastBollard != null){
                this.drawBollard(context, "#D6D4D4", marginLeft, (this.secondsAfterLastBollard*timeValue), parent.offsetHeight);
                marginLeft += (this.secondsAfterLastBollard*timeValue);
            }
        }
    }

    /**
     * Метод для получения значения ширины на одну секунду
     * 
     * @param {*} parentWidth  ширина родительского элемента 
     */
    getTimeValue(parentWidth){
        return (parentWidth / ((((this.countBollards*2)-1)*this.bollardSeconds)+this.secondsBeforeFirstBollard+this.secondsAfterLastBollard));
    }
    
    /**
     * Метод прорисовки столбца
     * 
     * @param {*} ctx контекст родительского элемента
     * @param {*} color цвет столбца
     * @param {*} marginLeft отступ от левого края родительского элемента
     * @param {*} width ширина столбца
     * @param {*} height высота столбца
     */
    drawBollard(ctx, color, marginLeft, width, height){
        ctx.beginPath();
        ctx.fillStyle=color;
        ctx.fillRect(marginLeft, 0, width, height); 
        ctx.stroke();
    }

    /**
     * Метод удаления столбиков
     */
    deleteBollards(){
        if(this.context != null)
            this.context.clearRect(0,0, this.parent.offsetWidth, this.parent.offsetHeight);
    }
}

var countBollards = 5; // количество столбцов
var bollardSeconds = 5; // количество секунд для столбца
var secondsBeforeFirstBollard = 3;  // количество секунд до первого столбца
var secondsAfterLastBollard = 3; // количество секунд после последнего столбца

var currentExercise = new Exercise(
    countBollards = 5,
    bollardSeconds = 5,
    secondsBeforeFirstBollard = 3,
    secondsAfterLastBollard = 3,
    events = [
        {time:100,   function:playSound, functionParameters: `${soundsStaticPath}/attention.mp3`},
        {time:2500,  function:playSound, functionParameters: `${soundsStaticPath}/strain.mp3`},
        {time:8000,  function:playSound, functionParameters: `${soundsStaticPath}/good4.mp3`},
        {time:12500, function:playSound, functionParameters: `${soundsStaticPath}/strain.mp3`},
        {time:18000, function:playSound, functionParameters: `${soundsStaticPath}/good4.mp3`},
        {time:22500, function:playSound, functionParameters: `${soundsStaticPath}/strain.mp3`},
        {time:28000, function:playSound, functionParameters: `${soundsStaticPath}/good4.mp3`},
        {time:32500, function:playSound, functionParameters: `${soundsStaticPath}/strain.mp3`},
        {time:38000, function:playSound, functionParameters: `${soundsStaticPath}/good4.mp3`},
        {time:42500, function:playSound, functionParameters: `${soundsStaticPath}/strain.mp3`},
        {time:48000, function:playSound, functionParameters: `${soundsStaticPath}/good4.mp3`},
        {time:51000, function:playSound, functionParameters: `${soundsStaticPath}/good7.mp3`},
    ],
);

var constants = new Constants();
var bluetoothAPI = new BluetoothAPI();

function onvchanged(event){
    bluetoothAPI.handleCharacteristicValueChanged(event);
}

var currentCycle = 1;
var currentExerciseTime = 0;
var currentRestTime = 0;

var graphicTimer= null; // Таймер для графика

var exerciseTimer = null; // Таймер для событий упражнения
var restTimer = null; // Таймер для отдыха

var cycleText = document.getElementById('cycleText');

var usersSelect = document.getElementById('users_');
var onlineModeCheckBox = document.getElementById('onlineSwitch');

let chartElement = document.getElementById('workArea');
var graphArea = document.getElementById('barsArea');

var controlElementsDiv = document.getElementById('controlElements');

var startButton = document.getElementById('startRandomButton');
var stopButton = document.getElementById('stopRandomButton');
var resumeButton = document.getElementById('resumeRandomButton');

var workSeconds = document.getElementById('workValue');
var restSeconds = document.getElementById('restValue');
var cyclesCount = document.getElementById('cyclesValue');
var timeLabel = document.getElementById('timeValue');
var applyButton = document.getElementById('apply');

var randomCheckBox = document.getElementById('randomCheckBox');

var restText = document.getElementById("restText");

var totalTime = 0;

var bollardAManager = new BollardAManager(countBollards, bollardSeconds, secondsBeforeFirstBollard, secondsAfterLastBollard);
createBollards();
var bluetoothBuffer = [];
var chartManager = null;

var isExercise = false;
var events= [];
var currentUserId = null;

var onlineMode = false;
var onlineTimer = null;

onlineModeCheckBox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    onlineModePage();
    onlineMode = true;
    getRemoteGraphData();
  } else {
    localModePage();
    onlineMode = false;
    clearInterval(onlineTimer);
  }
  stopRandom();
  clearGraph();
});

var currentOnlineData = null;

usersSelect.addEventListener('change', (event) => {
  currentUserId = usersSelect.value;
  getRemoteSettings();
  stopRandom();
  clearGraph();
});
/**
 * Метод при нажатии на кнопку подключения к bluetooth устройству
 */
function onButtonClick_BLE_connect(){
    bluetoothAPI.connectToBLEDevice();
}

/**
 * Метод при нажатии на кнопку остановки
 */
function onButtonClick_stop(){
    bluetoothAPI.disconnectFromDevice();
}

/**
 * Метод для отправки новых настроек для bluetooth устройства
 */
function applyNewSettings(){
    var buffer = new ArrayBuffer( 9 );
            buffer[ 0 ] = 0;
            buffer[ 1 ] = 0;
            buffer[ 2 ] = document.getElementById('gain').value; //Gain
		    buffer[ 3 ] = document.getElementById('filterFreq').value;; //FilterFreq
		    buffer[ 4 ] = document.getElementById('noiseLvlOut').value;; //NoiseLvlOut
		    buffer[ 5 ] = document.getElementById('noiseLvlIn').value;; //NoiseLvlIn
		    buffer[ 6 ] = document.getElementById('slideAverage').value;; //SlideAverage
		    buffer[ 7 ] = document.getElementById('averageMS').value;; //AverageMS
            buffer[ 8 ] = 0;
    bluetoothAPI.sendDataToDevice(buffer);
}

/**
 * Метод при нажатии на кнопку создания столбиков
 */
function createBollards(){
    bollardAManager.createBollards(graphArea);
}

function createGraph(){
    chartManager = new ChartManager(chartElement);
    chartManager.setXMax(getXAxisMax());
    // chartManager.generateRandomData();
}

function getXAxisMax(){
    var allTime = (((countBollards + countBollards - 1) * bollardSeconds) + secondsBeforeFirstBollard + secondsAfterLastBollard) * 1000; // общее количество секунд
    var countPoints = allTime / (1000 / constants.FREQUENCY_RECEIVING_DATA);
    return countPoints;
}

async function set_value(new_value){
    $.ajax({
        url: `${setGraphValueUrl}`,
        method: 'POST',
        data: JSON.stringify({user_id: currentUserId, new_data: new_value}),
        // если успешно, то
        success: function (response) {

        },
        // если ошибка, то
        error: function (response) {
            // предупредим об ошибке

        }
    });
    return false;
}

async function set_context(new_context){
    $.ajax({
        url: `${setContextUrl}`,
        method: 'POST',
        data: JSON.stringify({user_id: currentUserId, context: new_context}),
        // если успешно, то
        success: function (response) {
        },
        // если ошибка, то
        error: function (response) {
            // предупредим об ошибке

        }
    });
    return false;
}

async function startRandom(){
    startButton.disabled = true;
    stopButton.disabled = false;
    resumeButton.disabled = true;
    restText.setAttribute("hidden", "");

    if(graphicTimer == null){
        chartManager.clearChart();
        await set_context('exercise');
        await startExercise();
        graphicTimer = setInterval(
            function(){
                var valueToAdd = 0;
                if(onlineMode){
                    valueToAdd = bluetoothBuffer;
                }
                else{
                    if (randomCheckBox.checked){
                        valueToAdd = (Math.floor(Math.random() * (1024 - 1)) + 1);
                    }
                    else{
                        valueToAdd = bluetoothAPI.buffer[bluetoothAPI.buffer.length-1];
                    }
                    chartManager.addNewValue(valueToAdd);
                    set_value(valueToAdd);
                }
                totalTime += (1000 / constants.FREQUENCY_RECEIVING_DATA);
                timeLabel.value = msToTime(totalTime);
                if(totalTime >= (bollardAManager.bollardSeconds*(bollardAManager.countBollards+bollardAManager.countBollards-1)
                                    +bollardAManager.secondsBeforeFirstBollard + bollardAManager.secondsAfterLastBollard)*1000){
                    // stopRandom();
                }
            }, (1000 / constants.FREQUENCY_RECEIVING_DATA)
        );
    }
    else{
        stopRandom('start random');
        startRandom();
        // totalTime = 0;
    }
}

function stopRandom(from){
    // applyButton.disabled = false;
    resumeButton.disabled = false;
    set_context('exercise_stop');
    if(graphicTimer != null){
        clearInterval(graphicTimer);
        graphicTimer = null;
        clearInterval(exerciseTimer);
        exerciseTimer = null;
        clearInterval(restTimer);
        restTimer = null;
    }
}

async function resumeRandom(){
    applyButton.disabled = true;
    resumeButton.disabled = true;
    if(isExercise == false){
        startRest(currentRestTime);
    }
    else{
        if(graphicTimer == null){
            await set_context('exercise');
            await startExercise(currentExerciseTime);

            graphicTimer = setInterval(
                function(){
                    var valueToAdd = 0;
                    if (randomCheckBox.checked){
                        valueToAdd = (Math.floor(Math.random() * (1024 - 1)) + 1);
                    }
                    else{
                        valueToAdd = bluetoothAPI.buffer[bluetoothAPI.buffer.length-1];
                    }
                    chartManager.addNewValue(valueToAdd);
                    set_value(valueToAdd);
                    totalTime += (1000 / constants.FREQUENCY_RECEIVING_DATA);
                    timeLabel.value = msToTime(totalTime);
                    if(totalTime >= (bollardAManager.bollardSeconds*(bollardAManager.countBollards+bollardAManager.countBollards-1)
                                        +bollardAManager.secondsBeforeFirstBollard + bollardAManager.secondsAfterLastBollard)*1000){
                        // stopRandom('resume in if');
                    }
                }, (1000 / constants.FREQUENCY_RECEIVING_DATA)
            );
        }
        else{
            stopRandom('resume random');
            startRandom();
            // totalTime = 0;
        }
    }
    
}

function clearGraph(){
    applyButton.disabled = false;
    applyButton.disabled = false;
    startButton.disabled = false;
    stopRandom();
    chartManager.clearChart();
    totalTime = 0;
    timeLabel.value = totalTime;
    setSettingsReadonly(false);
    events = [...currentExercise.events];
}

function apply(){
    clearGraph();
    bollardSeconds = workSeconds.value;
    bollardAManager.bollardSeconds = workSeconds.value;
    createBollards();
    createGraph();

    cycleText.textContent =  `Cycle 1 of ${cyclesCount.value}`;

    currentExercise.bollardSeconds = workSeconds.value;
    currentExercise.recountEventsTimes();
    events = [...currentExercise.events];

    sendNewParameters();
}

async function sendNewParameters(){
    $.ajax({
        url: `${newParametersUrl}`,
        method: 'POST',
        data: JSON.stringify({user_id: currentUserId, work: workSeconds.value, rest:restSeconds.value, cycles: cyclesCount.value}),
        success: function (response) {
            console.log(response);
        },
        error: function (response) {
            console.log('Error in onlineModePage request');
        }
    });
}

function playSound(soundFile){
    // console.log(`Play Sound Event. Sound File: ${soundFile}`);
    var audio = new Audio(soundFile);
    audio.play();
}

async function startExercise(currentExerciseTimeV){
    setSettingsReadonly(true);
    restText.setAttribute("hidden", "");
    isExercise = true;

    cycleText.textContent =  `Cycle ${currentCycle} of ${cyclesCount.value}`;
    if(currentExerciseTimeV != null){
        currentExerciseTime = currentExerciseTimeV;
    }
    else{
        currentExerciseTime = 0;
    }
    if(events.length == 0){
        events = [...currentExercise.events];
    }
    if(cyclesCount.value >= currentCycle){
        exerciseTimer = setInterval(
            function(){
                currentExerciseTime += 100;
                if(events.length > 0){
                    if(events[0].time == currentExerciseTime){
                        events[0].function(events[0].functionParameters);
                        events.shift()
                    }
                }
                else{
                    clearInterval(exerciseTimer);
                    currentExerciseTime = 0;
                    setSettingsReadonly(false);
                    if(cyclesCount.value > currentCycle){
                        console.log('ex7');
                        currentCycle += 1;
                        startRest();
                    }
                    else if(cyclesCount.value == currentCycle){
                        clearInterval(exerciseTimer);
                        currentExerciseTime = 0;
                        setSettingsReadonly(false);
                        startButton.disabled = false;
                        stopButton.disabled = true;
                        resumeButton.disabled = true;
                        stopRandom();
                        set_context('exercise_finished');
                    }
                }
            }, 100
        );
    }
}

function startRest(currentRestTimeV){
    console.log('REST REST REST');
    isExercise = false;
    clearGraph();
    restText.removeAttribute("hidden");
    set_context('rest');
    if(currentRestTimeV != null){
        currentRestTime = currentRestTimeV;
    }
    else{
        currentRestTime = 0;
    }

    restTimer = setInterval(
        function(){
            currentRestTime += 100;
            restText.innerText = `Rest: ${msToTime(currentRestTime)}`;
            if (currentRestTime == restSeconds.value*1000){
                clearInterval(restTimer);
                restTimer = null;
                currentRestTime = 0;
                if(!onlineMode){
                    startRandom();
                }
            }
        }, 100
    );
}

function setSettingsReadonly(idDisabled){
    workSeconds.disabled = idDisabled;
    restSeconds.disabled = idDisabled;
    cyclesCount.disabled = idDisabled;
    timeLabel.disabled = idDisabled;
    applyButton.disabled = idDisabled;
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

/*
Работа с выбором текущего пользователя
*/

function setupUsers(){
    $.ajax({
        url: `${getUsersUrl}`,
        method: 'GET',
        success: function (response) {
            for(var i=0;i<response.users_list.length; i++){
                var opt = document.createElement('option');
                opt.value = response.users_list[i][1];
                opt.innerHTML = response.users_list[i][0];
                usersSelect.appendChild(opt);
            }
            currentUserId = response.users_list[0][1];
        },
        error: function (response) {
            console.log('Error in setupUsers request');
        }
    });
    return false;
}

function onlineModePage(){
    controlElementsDiv.setAttribute("hidden", "");
//    onlineTimer = setInterval(
//            function(){
//
//            }, 100);
$.ajax({
                    url: `${onlineModeUrl}`,
                    method: 'POST',
                    data: JSON.stringify({user_id: currentUserId}),
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (response) {
                        console.log('Error in onlineModePage request');
                    }
               });
}

function localModePage(){
    controlElementsDiv.removeAttribute("hidden");
}


function getRemoteGraphData(){
    onlineTimer = setInterval(
            function(){
                $.ajax({
                        url: `${getGraphDataUrl}`,
                        method: 'POST',
                        data: JSON.stringify({user_id: currentUserId}),
                        success: function (response) {
                            if(response.resp != 'error'){
                                if(response.graph_data.length == 0){
                                    stopRandom();
                                    clearGraph();
                                }
                                else{
                                    if(response.context != 'rest'){
                                        restText.setAttribute("hidden", '');
                                        chartManager.processRemoteData(response.graph_data);
                                    }
                                    else{
                                        if(restTimer == null){
                                            startRest();
                                        }
                                    }
                                    if(response.context == 'exercise_finished'){
                                        stopRandom();
                                        clearGraph();
                                        set_context('exercise_finished');
                                    }
                                }
                                currentCycle = response.current_cycle;
                                cycleText.textContent =  `Cycle ${currentCycle} of ${cyclesCount.value}`;
                            }
                        },
                        error: function (response) {
                            console.log('Error in getRemoteGraphData request');
                        }
                    });
            }, 100);
}

function getRemoteSettings(){
    $.ajax({
        url: `${onlineModeUrl}`,
        method: 'POST',
        data: JSON.stringify({user_id: currentUserId}),
        success: function (response) {
            if(response.resp != 'error'){
                if(response.exercise_settings.work[0] != ''){
                    workSeconds.value = response.exercise_settings.work;
                }
                if(response.exercise_settings.rest[0] != ''){
                    restSeconds.value = response.exercise_settings.rest;
                }
                if(response.exercise_settings.cycles[0] != ''){
                    cyclesCount.value = response.exercise_settings.cycles;
                }
                apply();
            }
        },
        error: function (response) {
            console.log('Error in onlineModePage request');
        }
    });
}