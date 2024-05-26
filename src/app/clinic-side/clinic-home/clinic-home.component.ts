import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto'
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-clinic-home',
  templateUrl: './clinic-home.component.html',
  styleUrls: ['./clinic-home.component.scss']
})
export class ClinicHomeComponent implements OnInit{
  pendingAppointmentsCount: number = 0;
  acceptedAppointmentsCount: number = 0;
  rejectedAppointmentsCount: number = 0;
  concludedAppointmentsCount: number = 0;
  appointmentDates: string[] = [];
  appointmentCounts: number[] = [];
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  totalAppointmentsPerMonth: { name: string; count: number }[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    ) {}

  ngOnInit() {
    this.populateYears();
    this.fetchAppointmentCounts();
  }

  populateYears() {
    const startYear = 2023;
    const endYear = 2050;
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

  async fetchAppointmentCounts() {
    try {
      const clinicUser = this.supabaseService.getClinicAuthStateSnapshot();

      if (clinicUser) {
        const { data: clinicUserData, error: clinicUserError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_users_tbl')
            .select('id')
            .eq('email', clinicUser.email);

        if (clinicUserError) {
          console.error('Error fetching clinic user data:', clinicUserError);
          return;
        } else if (clinicUserData && clinicUserData.length > 0) {
          const clinicUserId = clinicUserData[0].id;

          const { data: clinicsData, error: clinicsError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id')
              .eq('cUsers_id', clinicUserId);

          if (clinicsError) {
            console.error('Error fetching clinics data:', clinicsError);
            return;
          } else if (clinicsData && clinicsData.length > 0) {
            const clinicIds = clinicsData.map(clinic => clinic.id);

            const { data: appointmentsData, error: appointmentsError } =
              await this.supabaseService
                .getSupabase()
                .from('appointment_tbl')
                .select('status, aDate')
                .in('aClinic_id', clinicIds);

            if (appointmentsError) {
              console.error('Error fetching appointments data:', appointmentsError);
              return;
            } else {
              for (const appointment of appointmentsData || []) {
                switch (appointment.status) {
                  case 'Your appointment status is pending':
                    this.pendingAppointmentsCount++;
                    break;
                  case 'Your Appointment has been Approved':
                    this.acceptedAppointmentsCount++;
                    break;
                  case 'Your appointment has been Rejected':
                    this.rejectedAppointmentsCount++;
                    break;
                  case 'Appointment is Concluded':
                    this.concludedAppointmentsCount++;
                    break;
                  default:
                    break;
                }
                // Extract dates for line chart
                this.appointmentDates.push(appointment.aDate);
                // Increment count for the respective month
                // You may need to modify this based on how you want to group appointments by month
                this.appointmentCounts.push(1); // Increment by 1 for each appointment, modify this based on your data
              }

              this.filterAppointmentsByYear({ target: { value: this.selectedYear } });
              this.renderCharts();
            }
          } else {
            console.warn('No clinics found associated with the logged-in clinic user.');
          }
        } else {
          console.error('No clinic user data found for the logged-in clinic user.');
        }
      } else {
        console.warn('No logged-in clinic user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately, display user-friendly message if needed
    }
  }

  getTotalAppointmentsCount(): number {
    return (
      this.pendingAppointmentsCount +
      this.acceptedAppointmentsCount +
      this.rejectedAppointmentsCount +
      this.concludedAppointmentsCount
    );
  }

  calculatePercentage(count: number): number {
    const total = this.getTotalAppointmentsCount();
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }

  renderCharts() {
    this.renderPieChart();
  }

  renderPieChart() {
    const pieChartCanvas = document.getElementById('appointmentPieChart') as HTMLCanvasElement | null;
    
    if (pieChartCanvas) {
      const ctx = pieChartCanvas.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Pending', 'Accepted', 'Rejected', 'Concluded'],
            datasets: [{
              label: 'Appointment Status',
              data: [
                this.pendingAppointmentsCount,
                this.acceptedAppointmentsCount,
                this.rejectedAppointmentsCount,
                this.concludedAppointmentsCount
              ],
              backgroundColor: ['orange', 'blue', 'red', 'green'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true
          }
        });
      } else {
        console.error('Canvas context is null');
      }
    } else {
      console.error('Canvas element not found');
    }
  }

  filterAppointmentsByYear(event: any) {
    const selectedYear = event.value;
    const appointmentsInSelectedYear = this.appointmentDates.filter(date => new Date(date).getFullYear() === parseInt(selectedYear));
    const months = [
      { name: 'January', count: 0 },
      { name: 'February', count: 0 },
      { name: 'March', count: 0 },
      { name: 'April', count: 0 },
      { name: 'May', count: 0 },
      { name: 'June', count: 0 },
      { name: 'July', count: 0 },
      { name: 'August', count: 0 },
      { name: 'September', count: 0 },
      { name: 'October', count: 0 },
      { name: 'November', count: 0 },
      { name: 'December', count: 0 }
    ];
  
    for (const date of appointmentsInSelectedYear) {
      const month = new Date(date).getMonth();
      months[month].count++;
    }
  
    this.totalAppointmentsPerMonth = months;
    this.cdr.detectChanges(); // Trigger change detection
  }

  // Update this method to call filterAppointmentsByYear correctly
  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.filterAppointmentsByYear(this.selectedYear);
  }
  
}
