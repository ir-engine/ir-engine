resource "aws_s3_bucket" "s3_bucket" {
  bucket = "${var.app_name}-assets-${var.environment}"
  lifecycle {
    prevent_destroy = true
  }
  tags = var.default_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encryption" {
  bucket = aws_s3_bucket.s3_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_ownership_controls" "s3_bucket_ownership" {
  bucket = aws_s3_bucket.s3_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "s3_access_block" {
  bucket = aws_s3_bucket.s3_bucket.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "s3_cors_config" {
  bucket = aws_s3_bucket.s3_bucket.id
  cors_rule {
    allowed_headers = []
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}

data "aws_iam_policy_document" "s3_bucket_policy_data" {
  version   = "2008-10-17"
  policy_id = "PolicyForCloudFrontPrivateContent"
  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }
    actions = [
      "s3:GetObject",
      "s3:Get*",
      "s3:List*"
    ]
    resources = [
      "arn:aws:s3:::${aws_s3_bucket.s3_bucket.id}/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [aws_cloudfront_distribution.assets_cdn.arn]
    }
  }
  statement {
    sid    = "AllowS3UserAccess"
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        aws_iam_user.app_admin_user.arn
      ]
    }
    actions = ["s3:*"]
    resources = [
      "${aws_s3_bucket.s3_bucket.arn}/*",
      aws_s3_bucket.s3_bucket.arn,
    ]

  }
}

resource "aws_s3_bucket_policy" "s3_bucket_policy" {
  bucket = aws_s3_bucket.s3_bucket.id
  policy = data.aws_iam_policy_document.s3_bucket_policy_data.json
}
