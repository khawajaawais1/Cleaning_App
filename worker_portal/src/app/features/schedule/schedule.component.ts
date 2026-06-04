import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';

interface DayGroup {
  label: string;
  dateStr: string;
  jobs: Job[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  allJobs: Job[] = [];
  dayGroups: DayGroup[] = [];
  loading = true;

  calendarDays: { date: Date; label: string; hasJob: boolean; isToday: boolean; isSelected: boolean }[] = [];
  selectedDate: Date = new Date();

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.buildCalendar();
    this.jobService.getMyJobs().subscribe(jobs => {
      this.allJobs = jobs.filter(j => j.status !== 'cancelled');
      this.loading = false;
      this.buildGroups();
    });
  }

  buildCalendar(): void {
    const today = new Date();
    this.calendarDays = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        date: d,
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        hasJob: false,
        isToday: i === 0,
        isSelected: i === 0,
      };
    });
  }

  buildGroups(): void {
    this.calendarDays = this.calendarDays.map(d => ({
      ...d,
      hasJob: this.allJobs.some(j => new Date(j.scheduledDate).toDateString() === d.date.toDateString()),
    }));
    this.filterByDate(this.selectedDate);
  }

  selectDay(day: { date: Date; isSelected: boolean }): void {
    this.calendarDays = this.calendarDays.map(d => ({ ...d, isSelected: d.date.toDateString() === day.date.toDateString() }));
    this.selectedDate = day.date;
    this.filterByDate(day.date);
  }

  filterByDate(date: Date): void {
    const jobs = this.allJobs
      .filter(j => new Date(j.scheduledDate).toDateString() === date.toDateString())
      .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));

    const label = date.toDateString() === new Date().toDateString()
      ? 'Today'
      : date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

    this.dayGroups = jobs.length ? [{ label, dateStr: label, jobs }] : [];
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      assigned: 'pill-teal', en_route: 'pill-blue', in_progress: 'pill-green',
      extension_requested: 'pill-amber', completed: 'pill-gray',
    };
    return map[status] ?? 'pill-gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      assigned: 'Upcoming', en_route: 'En route', in_progress: 'In progress',
      extension_requested: 'Extension', completed: 'Done',
    };
    return map[status] ?? status;
  }
}
