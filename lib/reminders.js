import { MEASUREMENT_MOMENTS } from './plan-content.js';
import { PLAN_DATA } from './plan-data.js';
import { withDefaultSettings } from './insights.js';

export function getDateInTimeZone(now = new Date(), timezone = 'Europe/Amsterdam') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getReminderTargets({
  now = new Date(),
  settings = {},
  completedDayIds = [],
  checkinDates = [],
  planData = PLAN_DATA,
  measurementMoments = MEASUREMENT_MOMENTS,
} = {}) {
  const config = withDefaultSettings(settings);
  if (config.reminder_enabled === false) return [];

  const today = getDateInTimeZone(now, config.timezone);
  const completed = new Set(completedDayIds.map(Number));
  const savedCheckins = new Set(checkinDates);
  const targets = [];
  const todayTraining = planData.find(day => day.date === today && ['cycle', 'strength', 'walk'].includes(day.type));

  if (todayTraining && !completed.has(todayTraining.id)) {
    targets.push({
      kind: 'training',
      title: 'Training staat nog open',
      body: `${todayTraining.title} - ${todayTraining.dur || 0} min${todayTraining.target ? `, ${todayTraining.target}` : ''}`,
      tag: `training-${todayTraining.id}`,
      url: '/',
    });
  }

  const dueMeasurement = measurementMoments.find(moment => moment.date <= today && !savedCheckins.has(moment.date));
  if (dueMeasurement) {
    targets.push({
      kind: 'measurement',
      title: 'Meetmoment staat open',
      body: `${dueMeasurement.title} - ${dueMeasurement.focus}`,
      tag: `measurement-${dueMeasurement.key}`,
      url: '/',
    });
  }

  return targets;
}
