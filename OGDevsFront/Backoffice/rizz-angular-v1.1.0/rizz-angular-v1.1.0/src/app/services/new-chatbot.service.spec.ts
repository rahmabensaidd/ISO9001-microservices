import { TestBed } from '@angular/core/testing';

import { NewChatbotService } from './new-chatbot.service';

describe('NewChatbotService', () => {
  let service: NewChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
