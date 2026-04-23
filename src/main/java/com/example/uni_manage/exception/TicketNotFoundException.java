//TicketNotFoundException.java

package com.example.uni_manage.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String message) {
        super(message);
    }
}
