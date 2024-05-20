import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://api.paymongo.com/v1';
  private secretKey = 'sk_test_WR3fmS2kk7CxdVQdzmL5MuZU';

  constructor() {}

  private getAuthorizationHeader(): string {
    return 'Basic ' + btoa(this.secretKey + ':');
  }

  async createPaymentLink(amount: number, description: string, remarks: string) {
    const data = {
      data: {
        attributes: {
          amount: amount * 100, // Convert to cents
          currency: 'PHP',
          description: description,
          remarks: remarks,
        }
      }
    };

    try {
      const response = await axios.post(`${this.apiUrl}/links`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthorizationHeader()
        }
      });
      console.log('Payment link created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment link:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async getPaymentLinkStatus(linkId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/links/${linkId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthorizationHeader()
        }
      });
      console.log('Fetched payment link status:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment link status:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}
