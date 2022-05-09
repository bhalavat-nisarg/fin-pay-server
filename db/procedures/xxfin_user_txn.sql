CREATE OR REPLACE PROCEDURE XXFIN_USER_TXN  ( p_src_id      IN  NUMBER
                                            , p_tar_id      IN  NUMBER
                                            , p_currency    IN  VARCHAR2
                                            , p_amount      IN  NUMBER
                                            , p_method      IN  VARCHAR2
                                            , p_gateway     IN  VARCHAR2
                                            , p_mode        IN  VARCHAR2
                                            , p_desc        IN  VARCHAR
                                            , p_error_msg   OUT VARCHAR2)
AS
    ln_src_bal      NUMBER;
    ln_tar_bal      NUMBER;
    lc_src_cur      VARCHAR2(10);
    lc_tar_cur      VARCHAR2(10);
    
    ln_adm_bal      NUMBER;
    lc_adm_cur      VARCHAR2(10);
    ln_comm         NUMBER;
BEGIN

    SELECT XFU.balance, XFU.currency
      INTO ln_src_bal, lc_src_cur
      FROM xxfin_users XFU
    WHERE XFU.user_id = p_src_id;
    
    IF (UPPER(p_mode) = 'DEPOSIT') THEN
        UPDATE xxfin_users XFU
           SET XFU.balance = ln_src_bal + p_amount
         WHERE XFU.user_id = p_src_id;
         
         INSERT INTO xxfin_txn( gateway, method, description, amount, currency, auth_id, source_id
                              , target_id, txn_event, status, error_msg, creation_date, created_by)
                        VALUES( p_gateway, p_method, p_desc, p_amount, UPPER(p_currency), NULL, p_src_id
                              , p_tar_id, UPPER(p_mode), 'S', NULL, SYSDATE, p_src_id);

    ELSIF (UPPER(p_mode) = 'WITHDRAW') THEN
        IF (ln_src_bal = 0 OR ln_src_bal < p_amount) THEN
            p_error_msg := 'Insufficient balance!';
            INSERT INTO xxfin_txn( gateway, method, description, amount, currency, auth_id, source_id
                                  , target_id, txn_event, status, error_msg, creation_date, created_by)
                            VALUES( p_gateway, p_method, p_desc, p_amount, UPPER(p_currency), NULL, p_src_id
                                  , p_tar_id, UPPER(p_mode), 'E', p_error_msg, SYSDATE, p_src_id);
        ELSE
            UPDATE xxfin_users XFU
               SET XFU.balance = ln_src_bal - p_amount
             WHERE XFU.user_id = p_src_id;
             
             INSERT INTO xxfin_txn( gateway, method, description, amount, currency, auth_id, source_id
                                  , target_id, txn_event, status, error_msg, creation_date, created_by)
                            VALUES( p_gateway, p_method, p_desc, p_amount, UPPER(p_currency), NULL, p_src_id
                                  , p_tar_id, UPPER(p_mode), 'S', NULL, SYSDATE, p_src_id);
        END IF;
    ELSIF (UPPER(p_mode) = 'P2P') THEN
        IF (ln_src_bal = 0 OR ln_src_bal < p_amount) THEN
            p_error_msg := 'Insufficient balance!';
            INSERT INTO xxfin_txn( gateway, method, description, amount, currency, auth_id, source_id
                                  , target_id, txn_event, status, error_msg, creation_date, created_by)
                            VALUES( p_gateway, p_method, p_desc, p_amount, UPPER(p_currency), NULL, p_src_id
                                  , p_tar_id, UPPER(p_mode), 'E', p_error_msg, SYSDATE, p_src_id);
        ELSE
        
            SELECT XFU.balance, XFU.currency
              INTO ln_tar_bal, lc_tar_cur
              FROM xxfin_users XFU
            WHERE XFU.user_id = p_tar_id;
            
            ln_comm := ln_src_bal * 0.02;
            
            UPDATE xxfin_users XFU
               SET XFU.balance = ln_src_bal - p_amount - ln_comm
             WHERE XFU.user_id = p_src_id;
             
             UPDATE xxfin_users XFU
               SET XFU.balance = ln_tar_bal + p_amount
             WHERE XFU.user_id = p_tar_id;
             
             SELECT XFU.balance, XFU.currency
              INTO ln_adm_bal, lc_adm_cur
              FROM xxfin_users XFU
            WHERE XFU.user_id = -1;
            
            UPDATE xxfin_users XFU
               SET XFU.balance = ln_adm_bal + ln_comm
             WHERE XFU.user_id = -1;
             
             INSERT INTO xxfin_txn( gateway, method, description, amount, currency, auth_id, source_id
                                  , target_id, txn_event, status, error_msg, creation_date, created_by)
                            VALUES( p_gateway, p_method, p_desc, p_amount, UPPER(p_currency), NULL, p_src_id
                                  , p_tar_id, UPPER(p_mode), 'S', NULL, SYSDATE, p_src_id);
        END IF;
    END IF;

    COMMIT;
    
EXCEPTION
WHEN OTHERS THEN
    p_error_msg := SQLERRM;
END;