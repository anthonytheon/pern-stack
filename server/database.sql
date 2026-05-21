CREATE TABLE public.job_orders (
  job_order_id integer NOT NULL,
  jo_number character varying(20),
  jo_type character varying(20) NOT NULL,
  shipper_name character varying(255),
  consignee_name character varying(255),
  volume character varying(50),
  shipping_line character varying(255),
  vessel_name character varying(255),
  port_of_loading character varying(255),
  port_of_discharge character varying(255),
  person_in_charge character varying(255),
  eta date,
  etd date,
  goods text,
  loading_date date,
  closing_date date,
  aju_number character varying(50),
  sppb_date date,
  dooring_date date,
  extra_note text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT job_orders_pkey PRIMARY KEY (job_order_id),
  CONSTRAINT job_orders_jo_number_key UNIQUE (jo_number)
);

CREATE SEQUENCE public.job_orders_job_order_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE public.job_orders_job_order_id_seq
  OWNED BY public.job_orders.job_order_id;

ALTER TABLE ONLY public.job_orders
  ALTER COLUMN job_order_id SET DEFAULT nextval('public.job_orders_job_order_id_seq'::regclass);

CREATE TABLE public.containers (
  container_id integer NOT NULL,
  job_order_id integer,
  container_number character varying(20) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT containers_pkey PRIMARY KEY (container_id),
  CONSTRAINT containers_job_order_id_fkey
    FOREIGN KEY (job_order_id)
    REFERENCES public.job_orders(job_order_id)
    ON DELETE CASCADE
);

CREATE SEQUENCE public.containers_container_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE public.containers_container_id_seq
  OWNED BY public.containers.container_id;

ALTER TABLE ONLY public.containers
  ALTER COLUMN container_id SET DEFAULT nextval('public.containers_container_id_seq'::regclass);