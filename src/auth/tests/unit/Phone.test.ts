import { Phone } from '../../domain/value-objects/Phone';

describe('The Phone', () => {
  it('accepts a phone with only digits and valid length', () => {
    const phone = Phone.create('1234567890');

    expect(phone.value).toBe('1234567890');
  });

  it('rejects phone with letters', () => {
    expect(() => Phone.create('12345abc')).toThrow('Invalid phone format');
  });

  it('rejects phone shorter than 7 digits', () => {
    expect(() => Phone.create('123456')).toThrow('Invalid phone format');
  });

  it('considers two phones with same value as equal', () => {
    const phone1 = Phone.create('1234567890');
    const phone2 = Phone.create('1234567890');

    expect(phone1.equals(phone2)).toBe(true);
  });

  it('considers two phones with different values as not equal', () => {
    const phone1 = Phone.create('1234567890');
    const phone2 = Phone.create('0987654321');

    expect(phone1.equals(phone2)).toBe(false);
  });
});
