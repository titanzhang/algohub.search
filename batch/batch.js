require('./base.js');

var scheduler = load('batch.JobScheduler');

// month, date, hour, minute
scheduler.register('*', '*', '*', '*/5', 'UpdateAll', load('batch.Job.JobBuildAll'));

if (process.argv[2] === 'debug' && process.argv[3] !== undefined) {
	scheduler.execNow(process.argv[3]);
} else {	
	scheduler.run();
}
