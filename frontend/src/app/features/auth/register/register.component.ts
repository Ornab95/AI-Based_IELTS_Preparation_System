import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MockAuthService,
  RegistrationPayload,
} from '../../../core/services/mock-auth.service';

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  // ── Step Configuration ─────────────────────────────
  readonly totalSteps = 8;
  readonly currentStep = signal(1);
  readonly animationDirection = signal<'forward' | 'backward'>('forward');

  readonly steps: StepConfig[] = [
    { id: 1, title: 'Your Name', subtitle: "Let's get to know you", icon: '👤' },
    { id: 2, title: 'IELTS Experience', subtitle: 'Have you taken IELTS before?', icon: '📋' },
    { id: 3, title: 'Current Level', subtitle: 'Where do you stand now?', icon: '📊' },
    { id: 4, title: 'Target Band', subtitle: 'Aim for your dream score', icon: '🎯' },
    { id: 5, title: 'Exam Date', subtitle: 'When is your test?', icon: '📅' },
    { id: 6, title: 'Your Reason', subtitle: 'Why are you taking IELTS?', icon: '💡' },
    { id: 7, title: 'Focus Skill', subtitle: 'Which area needs the most work?', icon: '🔍' },
    { id: 8, title: 'Create Account', subtitle: 'Almost there! Set up your credentials', icon: '🔐' },
  ];

  // ── Form Data (Signals) ────────────────────────────
  name = signal('');
  hasTakenIelts = signal<boolean | null>(null);
  currentLevel = signal('');
  targetBand = signal(6.5);
  examDate = signal<Date | null>(null);
  reason = signal('');
  focusSkill = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // ── UI State ───────────────────────────────────────
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  stepErrors = signal<Record<number, string>>({});

  // ── Computed ───────────────────────────────────────
  readonly progressPercent = computed(() =>
    Math.round((this.currentStep() / this.totalSteps) * 100)
  );

  readonly currentStepConfig = computed(() =>
    this.steps.find((s) => s.id === this.currentStep())!
  );

  readonly isFirstStep = computed(() => this.currentStep() === 1);
  readonly isLastStep = computed(() => this.currentStep() === this.totalSteps);

  readonly canProceed = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return this.name().trim().length >= 2;
      case 2:
        return this.hasTakenIelts() !== null;
      case 3:
        return this.currentLevel() !== '';
      case 4:
        return this.targetBand() >= 4 && this.targetBand() <= 9;
      case 5:
        return this.examDate() !== null;
      case 6:
        return this.reason() !== '';
      case 7:
        return this.focusSkill() !== '';
      case 8:
        return (
          this.email().trim() !== '' &&
          this.password().trim().length >= 6 &&
          this.password() === this.confirmPassword()
        );
      default:
        return false;
    }
  });

  // ── Options Data ───────────────────────────────────
  readonly levelOptions = [
    { value: 'beginner', label: 'Beginner', desc: 'Just starting out', band: '< 4.0' },
    { value: 'elementary', label: 'Elementary', desc: 'Basic understanding', band: '4.0 – 4.5' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Can handle most situations', band: '5.0 – 5.5' },
    { value: 'upper-intermediate', label: 'Upper Intermediate', desc: 'Fairly fluent', band: '6.0 – 6.5' },
    { value: 'advanced', label: 'Advanced', desc: 'Very proficient', band: '7.0 – 8.0' },
    { value: 'not-sure', label: "I'm Not Sure", desc: "We'll help you assess", band: '—' },
  ];

  readonly reasonOptions = [
    { value: 'academic', label: 'Academic', icon: '🎓', desc: 'University admission' },
    { value: 'job', label: 'Career / Job', icon: '💼', desc: 'Professional requirements' },
    { value: 'pr', label: 'Permanent Residency', icon: '🏠', desc: 'Immigration process' },
    { value: 'visa', label: 'Visa Application', icon: '✈️', desc: 'Travel & settlement' },
    { value: 'self-improvement', label: 'Self Improvement', icon: '📈', desc: 'Personal growth' },
    { value: 'other', label: 'Other', icon: '🔖', desc: 'Something else' },
  ];

  readonly skillOptions = [
    { value: 'listening', label: 'Listening', icon: '🎧', color: 'from-cyan-500 to-blue-500' },
    { value: 'reading', label: 'Reading', icon: '📖', color: 'from-emerald-500 to-teal-500' },
    { value: 'writing', label: 'Writing', icon: '✍️', color: 'from-violet-500 to-purple-500' },
    { value: 'speaking', label: 'Speaking', icon: '🎙️', color: 'from-orange-500 to-red-500' },
    { value: 'not-sure', label: 'Not Sure', icon: '🤔', color: 'from-gray-400 to-gray-500' },
  ];

  readonly bandMarks = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

  constructor(
    private authService: MockAuthService,
    private router: Router
  ) {}

  // ── Navigation ─────────────────────────────────────
  nextStep(): void {
    if (!this.canProceed()) {
      this.setStepError(this.currentStep(), this.getStepErrorMessage(this.currentStep()));
      return;
    }
    this.clearStepError(this.currentStep());

    if (this.isLastStep()) {
      this.submitRegistration();
      return;
    }
    this.animationDirection.set('forward');
    this.currentStep.update((s) => Math.min(s + 1, this.totalSteps));
  }

  prevStep(): void {
    if (!this.isFirstStep()) {
      this.animationDirection.set('backward');
      this.currentStep.update((s) => Math.max(s - 1, 1));
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.animationDirection.set('backward');
      this.currentStep.set(step);
    }
  }

  // ── Helpers ────────────────────────────────────────
  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  selectIeltsExperience(value: boolean): void {
    this.hasTakenIelts.set(value);
  }

  selectLevel(value: string): void {
    this.currentLevel.set(value);
  }

  selectReason(value: string): void {
    this.reason.set(value);
  }

  selectSkill(value: string): void {
    this.focusSkill.set(value);
  }

  onBandSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.targetBand.set(parseFloat(input.value));
  }

  getBandLabel(band: number): string {
    if (band <= 4.5) return 'Modest';
    if (band <= 5.5) return 'Competent';
    if (band <= 6.5) return 'Good';
    if (band <= 7.5) return 'Very Good';
    if (band <= 8.5) return 'Expert';
    return 'Master';
  }

  getBandColor(band: number): string {
    if (band <= 4.5) return '#ef4444';
    if (band <= 5.5) return '#f97316';
    if (band <= 6.5) return '#eab308';
    if (band <= 7.5) return '#22c55e';
    if (band <= 8.5) return '#06b6d4';
    return '#8b5cf6';
  }

  getMinDate(): Date {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  formatDateString(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateDisplay(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── Validation ─────────────────────────────────────
  private getStepErrorMessage(step: number): string {
    switch (step) {
      case 1:
        return 'Please enter your full name (at least 2 characters).';
      case 2:
        return 'Please select an option.';
      case 3:
        return 'Please select your current level.';
      case 4:
        return 'Please set a valid target band.';
      case 5:
        return 'Please select your exam date.';
      case 6:
        return 'Please select your reason for taking IELTS.';
      case 7:
        return 'Please select the skill you want to focus on.';
      case 8:
        if (!this.email().trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()))
          return 'Please enter a valid email address.';
        if (this.password().length < 6)
          return 'Password must be at least 6 characters.';
        if (this.password() !== this.confirmPassword())
          return 'Passwords do not match.';
        return 'Please complete all fields.';
      default:
        return 'Please complete this step.';
    }
  }

  private setStepError(step: number, message: string): void {
    this.stepErrors.update((errors) => ({ ...errors, [step]: message }));
  }

  private clearStepError(step: number): void {
    this.stepErrors.update((errors) => {
      const updated = { ...errors };
      delete updated[step];
      return updated;
    });
  }

  getStepError(): string {
    return this.stepErrors()[this.currentStep()] || '';
  }

  // ── Submission ─────────────────────────────────────
  private submitRegistration(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload: RegistrationPayload = {
      name: this.name(),
      hasTakenIelts: this.hasTakenIelts(),
      currentLevel: this.currentLevel(),
      targetBand: this.targetBand(),
      examDate: this.formatDateString(this.examDate()),
      reason: this.reason(),
      focusSkill: this.focusSkill(),
      email: this.email(),
      password: this.password(),
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'An unexpected error occurred. Please try again.'
        );
      },
    });
  }
}
