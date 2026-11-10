const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
export const money = (value: number) => inr.format(value)
export const dateTime = (value: string) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))
export const shortId = (id: string) => id.slice(0, 8).toUpperCase()
