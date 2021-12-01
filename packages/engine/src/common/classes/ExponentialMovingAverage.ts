export class ExponentialMovingAverage {
  mean: number
  multiplier: number

  constructor(timePeriods = 10, startingMean = 0) {
    this.mean = startingMean
    this.multiplier = 2 / (timePeriods + 1)
  }

  update(newValue: number) {
    const meanIncrement = this.multiplier * (newValue - this.mean)
    const newMean = this.mean + meanIncrement
    this.mean = newMean
  }
}
