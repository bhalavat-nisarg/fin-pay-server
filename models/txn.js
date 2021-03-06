module.exports = {
    txnId: Number, // Auto generate sequence
    gateway: String,
    method: String,
    description: String,
    metadata: Object,
    status: String,
    error_msg: String,
    amount: Number,
    currency: String,
    auth_id: String,
    source_id: Number,
    target_id: Number,
    txn_event: String,
    creation_date: Date,
    created_by: String,
};
