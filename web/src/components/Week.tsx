import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';
import { url } from '../utils/api/axios_requests';
import { IndividualSlotData, JsonData, OneDayColumnData, OneWeekData } from '../utils/interface/WeekInterface';
import './Week.css';
import ColumnRow from './Week/ColumnRow';
import { ColumnTimeLeft, ColumnTimeRight } from './Week/ColumnTime';


let week_days: Array<string> = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday'
];

type WeekState = {
	data: Array<OneDayColumnData>
}

export default class Week extends Component {
	state: WeekState = {
		data: []
	};
	
	componentDidMount() {
		let week: number = 22;
		let room: string = 'Kakashi';
		
		axios.get(url + `bookings/${ week }/${ room }`)
			.then(response => {
				// return response.data;
				const data = this.buildDataAllInOne(response.data);
				// console.log('data');
				// console.log(data);
				this.setState({oneWeek: data});
			})
			.then(() => {
					// console.log('this.state.data', this.state.data);
				}
			)
			.catch(error => console.log(error));
	}
	
	buildDataAllInOne(responseData: [JsonData]) {
		let weekData: OneWeekData = {
			oneWeek: []
		};
		
		let oneDay: OneDayColumnData = {
			weekday: '',
			date: '',
			slotDatas: []
		};
		
		let timeNow = moment();
		let dateNow = timeNow.dayOfYear();
		let hourNow = timeNow.hour();
		
		const SLOT_DAYS = 5;
		const SLOTS_PER_DAY = 9;
		let index = 0;
		for (let j = 0; j < SLOT_DAYS; j++) {
			oneDay.weekday = week_days[j];
			oneDay.date = moment(responseData[j * 9].starting_time)
				.format('YYYY-MM-DD');
			for (let i = 0; i < SLOTS_PER_DAY; i++) {
				let timeInSlot = moment(responseData[index].starting_time);
				let dateInSlot = timeInSlot.dayOfYear();
				let hourInSlot = timeInSlot.hour();
				
				let tempPassedTimeSlot: boolean = false;
				let tempEmptySlot: boolean = false;
				let tempId: number = responseData[index]._id;
				let tempCompany: string = responseData[index].company;
				let tempBooker: string = responseData[index].booker;
				let tempStartTime: moment.Moment = responseData[index].starting_time;
				
				if (dateNow > dateInSlot) {
					tempPassedTimeSlot = true;
				} else if (dateNow === dateInSlot && hourNow > hourInSlot) {
					tempPassedTimeSlot = true;
				}
				
				if (tempCompany === '' && tempBooker === '') {
					tempEmptySlot = true;
				}
				
				let temp: IndividualSlotData = {
					passed_time_slot: tempPassedTimeSlot,
					empty_slot: tempEmptySlot,
					id: tempId,
					company: tempCompany,
					booker: tempBooker,
					start_time: tempStartTime
				};
				oneDay.slotDatas.push(temp);
				index += 1;
			}
			this.state.data.push(oneDay);
			oneDay = {
				weekday: '',
				date: '',
				slotDatas: []
			};
		}
		return weekData;
	}
	
	render() {
		return (
			<div className="tc">
				<div className="week-column">
					<ColumnTimeLeft/>
					{
						this.state.data.map((ds, i) => {
							return (
								<ColumnRow
									key={ i }
									weekday={ this.state.data[i].weekday }
									date={ this.state.data[i].date }
									slotDatas={ this.state.data[i].slotDatas }
								/>
							);
						})
					}
					<ColumnTimeRight/>
				</div>
			</div>
		);
	}
}
